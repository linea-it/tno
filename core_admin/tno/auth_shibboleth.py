import logging

from django.conf import settings
from django.contrib.auth.models import User, Group


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

    def authenticate(self, request, username=None, password=None):
        """
            Atributos Retornados pelo Shibbolet.
            Shib-Handler	https://dev.gidlab.rnp.br/Shibboleth.sso
            Shib-Application-ID	default
            Shib-Session-ID	_c7d1bd9c630f8bc656131fa95a3aa966
            Shib-Identity-Provider	https://idp-linea.cafeexpresso.rnp.br/idp/shibboleth
            Shib-Authentication-Instant	2019-12-06T13:18:07.496Z
            Shib-Authentication-Method	urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
            Shib-AuthnContext-Class	urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
            Shib-Session-Index	_40f63c469c1fd7f9013a6bb9bf3aa660
            Shib-Session-Expires	1575667087
            Shib-Session-Inactivity	1575641887
            Shib-brEduPerson-brEduAffiliationType	student
            Shib-eduPerson-eduPersonAffiliation	student
            Shib-eduPerson-eduPersonPrincipalName	3c23a1f2c7544f5cd31f59e7d7b0a35b@cafeexpresso.rnp.br
            Shib-inetOrgPerson-cn	glauber.costa
            Shib-inetOrgPerson-mail	glauber.costa@linea.gov.br
            Shib-inetOrgPerson-sn	glauber.costa
        """

        self.logger.info("Try Shibboleth Authentication")
        try:
            user_info = request.data

            self.logger.info(user_info)

            if 'Shib-Handler' in user_info:

                user = self.ensure_user(user_info)
                # user = User.objects.get(username='gverde')
                # self.logger.info(type(user))

                return user
            else:
                self.logger.info("Login Shibboleth Fail.")
                return None
        except Exception as e:
            self.logger.info(
                "Missing parameters needed to authenticate in Shibboleth.")
            self.logger.debug(e)
            return None

    def ensure_user(self, user_info):
        self.logger.info(
            "Verifying that the user [%s - %s] already exists in the administrative database" % (
                user_info.get('Shib-inetOrgPerson-mail'), user_info.get('Shib-inetOrgPerson-cn')))
        try:
            user = User.objects.get(username=user_info.get(
                'Shib-inetOrgPerson-cn'), email=user_info.get('Shib-inetOrgPerson-mail'))

            self.logger.info("User already registered.")

        except User.DoesNotExist:
            user = User(username=user_info.get('username'),
                        email=user_info.get('Shib-inetOrgPerson-mail'))

            self.logger.info("User not registered, first access.")

        # update user info
        # user.first_name=user_info['firstname']
        # user.last_name=user_info['lastname']
        user.save()

        self.logger.info("Updated user data")

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
