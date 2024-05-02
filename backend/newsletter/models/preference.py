from django.db import models
from newsletter.models.subscription import Subscription

class Preference(models.Model):

    subscription_id = models.ForeignKey(Subscription,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return str(self.id)