from django.contrib import admin

# Register your models here.
from gwauth.models import GWCloudUser, Verification, APIToken

admin.site.register(Verification)


@admin.register(GWCloudUser)
class GWCloudUserAdmin(admin.ModelAdmin):
    pass


@admin.register(APIToken)
class APITokenAdmin(admin.ModelAdmin):
    readonly_fields = ['token']
