import logging
import os
import json
from django.conf import settings
from django.contrib.auth.models import User, Group
import pyAesCrypt


class ShibbolethBackend(object):
    def __init__(self):
        # Get an instance of a logger
        self.logger = logging.getLogger('auth_shibboleth')

    # this method is needed by Django auth backend
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def authenticate(self, request, session_data, username=None, password=None, ):
        self.logger.info("Shibboleth Authentication Backend")
        try:
            # Recuperar o usuario usando os dados de sessao lidos do arquivo.
            user = self.ensure_user(session_data)

            return user

        except Exception as e:
            self.logger.error(e)
            return None

    def ensure_user(self, session_data):
        try:

            self.logger.info(
                "Verifying that the user already exists in the administrative database")

            self.logger.debug("Username: [ %s ] User Email: [ %s ]" % (
                session_data.get('Shib-inetOrgPerson-cn'), session_data.get('Shib-inetOrgPerson-mail')))

            user = User.objects.get(username=session_data.get(
                'Shib-inetOrgPerson-cn'), email=session_data.get('Shib-inetOrgPerson-mail'))

            self.logger.info(
                "User already registered.")

            self.logger.debug(
                "User Id: [ %s] Username: [ %s ]" % (user.pk, user.username))

        except KeyError as e:
            self.logger.error(
                "Shib attribute attribute does not exist in the session file")
            raise(e)

        except User.DoesNotExist:
            self.logger.info("User not registered, first access.")
            user = self.create_new_user(session_data)

        # update user info
        # user.first_name=user_info['firstname']
        # user.last_name=user_info['lastname']
        # user.save()
        # self.logger.info("Updated user data")

        group = self.ensure_group('Shibboleth')
        user.groups.add(group)

        return user

    def ensure_group(self, name):
        try:
            group = Group.objects.get(name=name)
        except Group.DoesNotExist:
            group = Group(name=name)
            group.save()

        return group

    def create_new_user(self, session_data):
        self.logger.info("Creating a new user")

        user = User(username=session_data.get('Shib-inetOrgPerson-cn'),
                    email=session_data.get('Shib-inetOrgPerson-mail'))

        user.save()

        self.logger.info("A new user has been created. [%s]" % user.pk)

        return user

    def read_session_file(self, session_id):
        """
            Recuperar os dados da sessao, usando arquivo compartilhado com o app Shibboleth.
            no diretorio configurado no settings deve existir um arquivo com os dados da sessao.
            o Nome do arquivo é o valor de session_id. 
            o arquivo vai estar criptografado com esta lib: https://pypi.org/project/pyAesCrypt/
            a chave para descriptografica esta no settings na variavel: AUTH_SHIB_CRYPT_KEY
            e o seu conteudo é este:
            {
                "Shib-Handler": "https://dev.gidlab.rnp.br/Shibboleth.sso",
                "Shib-Application-ID": "default",
                "Shib-Session-ID": "_c7d1bd9c630f8bc656131fa95a3aa966",
                "Shib-Identity-Provider": "https://idp-linea.cafeexpresso.rnp.br/idp/shibboleth",
                "Shib-Authentication-Instant": "2019-12-06T13:18:07.496Z",
                "Shib-Authentication-Method": "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
                "Shib-AuthnContext-Class": "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
                "Shib-Session-Index": "_40f63c469c1fd7f9013a6bb9bf3aa660",
                "Shib-Session-Expires": 1575667087,
                "Shib-Session-Inactivity": 1575641887,
                "Shib-brEduPerson-brEduAffiliationType": "student",
                "Shib-eduPerson-eduPersonAffiliation": "student",
                "Shib-eduPerson-eduPersonPrincipalName": "3c23a1f2c7544f5cd31f59e7d7b0a35b@cafeexpresso.rnp.br",
                "Shib-inetOrgPerson-cn": "glauber.costa",
                "Shib-inetOrgPerson-mail": "glauber.costa@linea.gov.br",
                "Shib-inetOrgPerson-sn": "glauber.costa"
            }
        """
        filepath_crypt = os.path.join(
            settings.AUTH_SHIB_SESSIONS, session_id + '.aes')
        filepath = os.path.join(settings.AUTH_SHIB_SESSIONS, session_id)
        try:
            self.logger.debug(
                "Decrypt session file: [%s -> %s]" % (filepath_crypt, filepath))

            # decrypt
            bufferSize = 64 * 1024
            password = settings.AUTH_SHIB_CRYPT_KEY
            pyAesCrypt.decryptFile(
                filepath_crypt, filepath, password, bufferSize)

            os.remove(filepath_crypt)
            self.logger.debug(
                "Destroying the encrypted session file: [%s]" % filepath_crypt)

            with open(filepath) as f:
                session_data = json.loads(f.read())

            self.logger.debug("Session File Content")
            self.logger.debug(json.dumps(session_data, indent=4))

            return session_data

        except FileNotFoundError as e:
            self.logger.error("Session file does not exist. filepath: [%s]")
            raise(e)

    def destroy_session_file(self, session_id):
        self.logger.debug("Destroying the session file")

        filepath = os.path.join(settings.AUTH_SHIB_SESSIONS, session_id)
        try:
            os.remove(filepath)
        except Exception as e:
            self.logger.error(e)
