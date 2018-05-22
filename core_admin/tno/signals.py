
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import CustomList
from .skybotoutput import FilterObjects

@receiver(post_save, sender=User)
def init_new_user(sender, instance, signal, created, **kwargs):
    """
        This method creates an access token every time a new user is created.
    """
    if created:
        Token.objects.create(user=instance)


@receiver(post_save, sender=CustomList)
def create_custom_list_table(sender, instance, signal, created, **kwargs):
    """
        This method performs the function responsible for creating 
        the table related to Customlist, after running updates the status and data of the CustomList.
    """
    if created:
        try:
            instance.status = 'running'
            instance.save()

            result = FilterObjects().create_object_list(
                tablename=instance.tablename,
                name=instance.filter_name,
                objectTable=instance.filter_dynclass, 
                magnitude=instance.filter_magnitude, 
                diffDateNights=instance.filter_diffdatenights, 
                moreFilter=instance.filter_morefilter
            )

            # Update Instance with new values
            instance.database = result.get('database')
            instance.schema = result.get('schema')
            instance.creation_time = result.get('creation_time')
            instance.sql = result.get('sql_content')
            instance.sql_creation = result.get('sql_creation')
            instance.rows = result.get('rows')
            instance.n_columns = result.get('n_columns')
            instance.columns = ';'.join(result.get('columns'))
            instance.size = result.get('size')
            instance.status = 'success'

            instance.save()

        except Exception as e:
            instance.status = 'error'
            instance.error_msg = e
            instance.save()
            
            raise(e)