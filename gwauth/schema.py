import graphene
from graphene import relay, ObjectType
from graphene_django.filter import DjangoFilterConnectionField

from graphene_django.types import DjangoObjectType

from gwauth.models import GWCloudUser
from gwauth.views import register


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

    result = graphene.Field(RegisterResult)

    @classmethod
    def mutate_and_get_payload(cls, *args, **kwargs):
        result, errors = register(kwargs)
        return Register(result=RegisterResult(
            result=result,
            errors=[FormError(field=k, messages=v) for k, v in errors])
        )


class Query(object):
    gwclouduser = relay.Node.Field(GWCloudUserNode)
    all_gwcloudusers = DjangoFilterConnectionField(GWCloudUserNode, fields=('id', 'username', 'first_name', 'last_name'))


class Mutation(graphene.ObjectType):
    register = Register.Field()
