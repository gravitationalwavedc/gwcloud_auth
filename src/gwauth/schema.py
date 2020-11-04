import graphene
from django.conf import settings
from django.db.models import Q
from graphene import relay, ObjectType
from graphql_jwt.decorators import login_required
from gwauth.models import GWCloudUser
from gwauth.utility import jwt_authentication
from gwauth.views import register, verify


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

    def resolve_user_id(self, info, **kwargs):
        return self.id


class UserTermFilterType(graphene.ObjectType):
    term = graphene.String()
    users = graphene.List(UserDetails)


class UserFilterType(graphene.ObjectType):
    terms = graphene.List(UserTermFilterType)


class Query(object):
    gwclouduser = graphene.Field(UserDetails)
    username_filter = graphene.Field(UserFilterType, search=graphene.String())
    username_lookup = graphene.List(UserDetails, ids=graphene.List(graphene.Int))

    @login_required
    def resolve_gwclouduser(self, info, **kwargs):
        return info.context.user

    @jwt_authentication(settings.AUTH_SERVICE_JWT_SECRET)
    def resolve_username_lookup(self, info, **kwargs):
        # Get the list of ids to map
        ids = kwargs.get("ids")
        return GWCloudUser.objects.filter(id__in=ids)

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
                    users=GWCloudUser.objects.filter(
                        Q(username__icontains=term) |
                        Q(first_name__icontains=term) |
                        Q(last_name__icontains=term)
                    )
                )
            )

        return UserFilterType(terms=terms)


class Mutation(graphene.ObjectType):
    register = Register.Field()
    verify = Verify.Field()
