import graphene
from graphene import relay, ObjectType
from graphene_django.filter import DjangoFilterConnectionField

from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import login_required

from gwauth.models import GWCloudUser
from gwauth.views import register, verify


class GWCloudUserNode(DjangoObjectType):
    class Meta:
        model = GWCloudUser
        #fields = ('id', 'username', 'first_name', 'last_name')
        interfaces = (relay.Node, )


class FormError(ObjectType):
    field = graphene.String()
    messages = graphene.List(graphene.String)


class RegisterResult(ObjectType):
    result = graphene.Boolean()
    errors = graphene.List(FormError)


class Register(relay.ClientIDMutation):
    class Input:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)
        password1 = graphene.String(required=True)
        password2 = graphene.String(required=True)
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
    username = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()


class Query(object):
    gwclouduser = graphene.Field(UserDetails)
    #all_gwcloudusers = DjangoFilterConnectionField(GWCloudUserNode, fields=('id', 'username', 'first_name', 'last_name'))

    @login_required
    def resolve_gwclouduser(self, info, **kwargs):
        return info.context.user


class Mutation(graphene.ObjectType):
    register = Register.Field()
    verify = Verify.Field()
