# Create your tasks here
from celery import shared_task

# Example task
@shared_task
def add(x=2, y=2):
    return x + y

