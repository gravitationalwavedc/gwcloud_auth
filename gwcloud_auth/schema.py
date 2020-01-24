import graphene
import gwauth.schema


class Query(gwauth.schema.Query, graphene.ObjectType):
    pass


class Mutation(gwauth.schema.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
