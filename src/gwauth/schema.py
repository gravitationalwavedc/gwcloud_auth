import graphene
from django.conf import settings
from graphene import relay, ObjectType
from graphql_jwt.decorators import login_required
from gwauth.models import GWCloudUser, APIToken
from gwauth.utility import jwt_authentication
from gwauth.views import register, verify
from graphql_jwt.refresh_token.shortcuts import refresh_token_lazy
from graphql_jwt.shortcuts import get_token
from graphql import GraphQLError


class FormError(ObjectType):
    field = graphene.String()
    messages = graphene.List(graphene.String)


class RegisterResult(ObjectType):
    result = graphene.Boolean()
    errors = graphene.List(FormError)


class Register(relay.ClientIDMutation):
    class Input:
        email = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        password = graphene.String(required=True)
        captcha = graphene.String(required=True)

    result = graphene.Field(RegisterResult)

    @classmethod
    def mutate_and_get_payload(cls, *args, **kwargs):
        result, errors = register(kwargs)
        return Register(result=RegisterResult(
            result=result,
            errors=[FormError(field=k, messages=v) for k, v in errors])
        )


class VerifyResult(ObjectType):
    result = graphene.Boolean()
    message = graphene.String()


class Verify(relay.ClientIDMutation):
    class Input:
        code = graphene.String(required=True)

    result = graphene.Field(VerifyResult)

    @classmethod
    def mutate_and_get_payload(cls, *args, **kwargs):
        result, message = verify(kwargs)

        return Verify(result=VerifyResult(
            result=result,
            message=message)
        )


class UserDetails(ObjectType):
    user_id = graphene.Int()
    username = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    is_ligo_user = graphene.Boolean()

    def resolve_user_id(self, info, **kwargs):
        return self.id


class UserTermFilterType(graphene.ObjectType):
    term = graphene.String()
    users = graphene.List(UserDetails)


class UserFilterType(graphene.ObjectType):
    terms = graphene.List(UserTermFilterType)


class CreateAPIToken(relay.ClientIDMutation):
    class Input:
        app = graphene.String(required=True)

    result = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, app):
        user = info.context.user

        if not user.is_authenticated:
            raise GraphQLError('You do not have permission to perform this action')

        token = APIToken(user=user, app=app)
        token.save()

        return CreateAPIToken(
            result=token.token
        )


class RevokeAPIToken(relay.ClientIDMutation):
    class Input:
        app = graphene.String(required=True)

    result = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, app):
        user = info.context.user

        if not user.is_authenticated:
            raise GraphQLError('You do not have permission to perform this action')

        token = APIToken.objects.get(user=user, app=app)
        token.delete()

        return RevokeAPIToken(
            result=f"{user.username}\'s API token for the {app} app has been deleted"
        )


class JWTType(ObjectType):
    jwt_token = graphene.String()
    refresh_token = graphene.String()


class Query(object):
    gwclouduser = graphene.Field(UserDetails)
    username_filter = graphene.Field(UserFilterType, search=graphene.String())
    username_lookup = graphene.List(UserDetails, ids=graphene.List(graphene.Int))
    api_token = graphene.String(app=graphene.String(required=True))
    jwt_token = graphene.Field(JWTType, token=graphene.String(required=True))

    @login_required
    def resolve_gwclouduser(self, info, **kwargs):
        return info.context.user

    @jwt_authentication(settings.AUTH_SERVICE_JWT_SECRET)
    def resolve_username_lookup(self, info, **kwargs):
        # Get the list of ids to map
        ids = kwargs.get("ids")
        return GWCloudUser.filter_by_ids(ids)

    @jwt_authentication(settings.AUTH_SERVICE_JWT_SECRET)
    def resolve_username_filter(self, info, **kwargs):
        # Get the search criteria
        search = kwargs.get("search")

        # Start with an empty user array
        terms = []

        # Iterate over each search term
        for term in search.split(' '):
            # Remove any whitespace
            term = term.strip()

            # Make sure this term is actually valid
            if not len(term):
                continue

            # Search for all users by this term and add the term to the result
            terms.append(
                UserTermFilterType(
                    term=term,
                    users=GWCloudUser.filter_by_term(term)
                )
            )

        return UserFilterType(terms=terms)

    @login_required
    def resolve_api_token(self, info, app):
        return APIToken.objects.get(user=info.context.user, app=app).token

    def resolve_jwt_token(self, info, token):
        user = APIToken.objects.get(token=token).user

        token = get_token(user)
        refresh_token = refresh_token_lazy(user)

        return JWTType(jwt_token=token, refresh_token=str(refresh_token))


class Mutation(graphene.ObjectType):
    register = Register.Field()
    verify = Verify.Field()
    create_api_token = CreateAPIToken.Field()
    revoke_api_token = RevokeAPIToken.Field()
