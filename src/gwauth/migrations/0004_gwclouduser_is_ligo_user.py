# Generated by Django 2.2.10 on 2020-02-14 00:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gwauth", "0003_auto_20200128_0850"),
    ]

    operations = [
        migrations.AddField(
            model_name="gwclouduser",
            name="is_ligo_user",
            field=models.BooleanField(default=False),
        ),
    ]
