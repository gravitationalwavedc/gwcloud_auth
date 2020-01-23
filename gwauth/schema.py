from graphene import relay, ObjectType
from graphene_django.filter import DjangoFilterConnectionField

from graphene_django.types import DjangoObjectType

from gwauth.models import GWCloudUser


class GWCloudUserNode(DjangoObjectType):
    class Meta:
        model = GWCloudUser
        fields = ('id', 'username', 'first_name', 'last_name')
        interfaces = (relay.Node, )


class Query(object):
    gwclouduser = relay.Node.Field(GWCloudUserNode)
    all_gwcloudusers = DjangoFilterConnectionField(GWCloudUserNode, fields=('id', 'username', 'first_name', 'last_name'))
