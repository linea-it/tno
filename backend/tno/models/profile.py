from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    class Meta:
        verbose_name_plural = "profile"

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    dashboard = models.BooleanField(default=False)

    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        """Cria um profile para o usuario e adiciona dashboard como verdadeiro.
        Só é executado quando um usuario é criado.

        Args:
            instance (User): instancia do model User.
            created (bool): True se o evento for disparado pela criação de um novo usuario.
        """
        if created:
            Profile.objects.get_or_create(user=instance, defaults={"dashboard": False})
