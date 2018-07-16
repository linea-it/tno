import logging
import os, errno, shutil
from django.conf import settings

class ProccessManager():

    def __init__(self):
        self.logger = logging.getLogger("proccess")

    def createProccessDirectory(self, instance):

        proccess_dir = settings.PROCCESS_DIR
        directory_name = str(instance.id)
        directory = os.path.join(proccess_dir, directory_name)
        absolute_path = os.path.join(os.environ['PROCCESS_DIR'], directory_name)

        try:
            # Criar o Diretorio
            os.makedirs(directory)

            # Alterar a Permissao do Diretorio
            os.chmod(directory, 0o775)

            self.logger.info("Process directory created")
            self.logger.debug("Directory: %s" % directory)
            self.logger.debug("Absolute Path: %s" % absolute_path)

            instance.relative_path = directory
            instance.absolute_path = absolute_path
            instance.save()

            return instance

        except OSError as e:
            instance.status = 'error'
            instance.save()
            self.logger.error("Failed to create process directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

    def purge(self, instance):
        self.logger.info("Process Purge")
        try:

            if not instance.purged and instance.relative_path is not None:
                directory = instance.relative_path

                self.logger.debug("Directory: %s" % directory)

                shutil.rmtree(directory)

                self.logger.debug("Removed directory: %s" % directory)

                instance.purged = True
                instance.save()

                return instance
            else:
                self.logger.warning("Process has already been marked as purged.")

                return instance

        except Exception as e:
            self.logger.error("Failed to remove process directory [ %s ]" % directory)
            self.logger.error(e)
            raise