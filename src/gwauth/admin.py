from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin

from gwauth.models import GWCloudUser, Verification

admin.site.register(GWCloudUser, UserAdmin)
admin.site.register(Verification)