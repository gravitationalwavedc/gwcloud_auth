# Generated by Django 2.2.17 on 2020-11-19 23:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gwauth', '0005_auto_20201028_0429'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gwclouduser',
            name='first_name',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='gwclouduser',
            name='last_name',
            field=models.CharField(max_length=50),
        ),
    ]
