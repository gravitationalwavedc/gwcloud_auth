import graphene
import gwauth.schema


class Query(gwauth.schema.Query, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query)
