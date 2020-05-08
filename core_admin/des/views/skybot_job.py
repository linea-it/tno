from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from des.models import SkybotJob
from des.serializers import SkybotJobSerializer


class SkybotJobViewSet(mixins.RetrieveModelMixin,
                       mixins.ListModelMixin,
                       viewsets.GenericViewSet):
    """
        Este end point esta com os metodos de Create, Update, Delete desabilitados. 
        estas operações vão ficar na responsabilidades do pipeline des/skybot. 

        o Endpoint xxx é responsavel por iniciar o pipeline que será executado em background.
    """
    queryset = SkybotJob.objects.all()
    serializer_class = SkybotJobSerializer
    ordering_fields = ('id', 'status', 'start', 'finish')
    ordering = ('-start',)

    @action(detail=False, methods=['post'])
    def submit_job(self, request, pk=None):
        """
            Este endpoint apenas cria um novo registro na tabela Des/Skybot Jobs. 
            
            O Job é criado com status idle. uma daemon verifica 
            de tempos em tempos os jobs neste status e inicia o processamento. 

            Parameters:
                date_initial (datetime): data inicial usada para selecionar as exposições que serão processadas.

                date_final (datetime): data Final usado para selecionar as exposições que serão processadas

            Returns:
                job (SkybotJobSerializer): Job que acabou de ser criado.
        """
        params = request.data

        # TODO: Criar metodo para validar os perios. 
        # e checar se o periodo ainda não foi executado. 
        date_initial = params['date_initial']
        date_final = params['date_final']


        # Recuperar o usuario que submeteu o Job. 
        owner = self.request.user

        # Criar um model Skybot Job
        job = SkybotJob(
            owner=owner,
            date_initial=date_initial,
            date_final=date_final,
            # Job começa com Status Idle. 
            status=1,
        )
        job.save()

        result = SkybotJobSerializer(job)

        return Response(result.data)
