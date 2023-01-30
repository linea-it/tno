import logging
import os
import errno
import shutil
from django.conf import settings

# from .skybotoutput import FilterObjects


class ProccessManager:
    def __init__(self):
        self.logger = logging.getLogger("proccess")

    def createProccessDirectory(self, instance):

        proccess_dir = settings.PROCCESS_DIR
        directory_name = str(instance.id)
        directory = os.path.join(proccess_dir, directory_name)
        absolute_path = os.path.join(os.environ["PROCCESS_DIR"], directory_name)

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

        except OSError as e:
            instance.status = "error"
            instance.save()
            self.logger.error("Failed to create process directory [ %s ]" % directory)
            if e.errno != errno.EEXIST:
                self.logger.error(e)
                raise

        self.logger.info("Creating directory for objects")

        objects, object_count = self.get_objects(
            tablename=instance.input_list.tablename, schema=instance.input_list.schema
        )

        self.logger.debug(objects)

        self.logger.info("Distinct Objects: %s" % len(objects))

        objects_dir = os.path.join(directory, "objects")
        try:
            # Criar o Diretorio
            os.makedirs(objects_dir)

            # Alterar a Permissao do Diretorio
            os.chmod(objects_dir, 0o775)

        except OSError as e:
            self.logger.error("Failed to create directory for Objects")
            self.logger.error(e)
            raise

        for object in objects:
            directory_name = object.get("name").replace(" ", "_")
            object_directory = os.path.join(objects_dir, directory_name)

            try:

                # Criar o Diretorio
                if not os.path.exists(object_directory):
                    os.makedirs(object_directory)

                # Alterar a Permissao do Diretorio
                os.chmod(object_directory, 0o775)

                self.logger.debug("Object Dir: %s" % object_directory)

            except OSError as e:
                self.logger.error(
                    "Failed to create directory for Object [ %s ]" % object.get("name")
                )
                self.logger.error(e)
                raise

        return instance

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
            # raise

    def get_objects(self, tablename, schema=None):
        return FilterObjects().list_distinct_objects_by_table(tablename, schema)
