from django.core.management.base import BaseCommand, CommandError

# from tno.models import SkybotRun

# class Command(BaseCommand):
#     help = 'Check skybot runs table and execute tasks based on status.'


#     def get_data_from_skybot(self, current):
#         self.stdout.write("Start run ID [ %s ]" % current.id)

#         ImportSkybotManagement().start_import_skybot(current.id)


#     def handle(self, *args, **options):

#         self.stdout.write("Finding Run with status pending")

#         runnings = SkybotRun.objects.filter(status='running')

#         pendings = SkybotRun.objects.filter(status='pending').order_by('start')


#         if runnings.count():
#             self.stdout.write("JA EXISTE UMA TAREFA RODANDO NAO FAZ NADA")

#         else:
#             if pendings.count():

#                 self.stdout.write("[ %s ] tasks pending" % pendings.count())

#                 current = pendings.first()

#                 self.get_data_from_skybot(current)


#             else:
#                 self.stdout.write("NAO TEM NINGUEM PENDENTE")

