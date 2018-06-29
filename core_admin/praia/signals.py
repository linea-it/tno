
from django.db.models.signals import post_save
from django.dispatch import receiver
from praia.models import Configuration
from praia.models import Run
import logging

@receiver(post_save, sender=Run)
def test_signal(sender, instance, signal, created, **kwargs):
    """
        This method creates an access token every time a new user is created.
    """
    logger = logging.getLogger("astrometry")    
    
    if created:
        logger.info("Was Created a new record of PRAIA Run")        

        instance.status = 'running'
        instance.save()
        
        # Criar o Diretorio da rodada do PRAIA

        # Criar arquivo input

        # Criar arquivo config.dat

        # Criar o link para as imagens

        # Simular os arquivos de output

        # Encerrar a Rodada do praia



