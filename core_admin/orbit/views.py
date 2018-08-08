from django.shortcuts import render
from rest_framework import viewsets
from .models import OrbitRun
from .serializers import OrbitRunSerializer
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
import os

class OrbitRunViewSet(viewsets.ModelViewSet):
    queryset = OrbitRun.objects.all()
    serializer_class = OrbitRunSerializer
    filter_fields = ('id','owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    @list_route()
    def log_by_objects(self, request):
        name =  request.query_params.get('name')
        run = request.query_params.get('cod')

        try:
            orbit_run = OrbitRun.objects.get(id=int(run))

            proccess = orbit_run.proccess

            print(proccess.relative_path)

            obj_path = os.path.join(proccess.relative_path, "objects", name.replace(" ", "_"))
            print(obj_path)
            log_file = os.path.join(obj_path, "nima.log")
            print(log_file)
            # Checar se o log existe
            result  = dict({
                'lines' : list(),
                })

            if os.path.exists(log_file):
                with open(log_file, 'r') as fp:
                    lines = fp.readlines()
                    for line in lines:
                        result["lines"].append(line.strip())

                return Response(result)
            else:
                return Response(dict({
                    'success': False,
                    'msg': 'Deu Ruim'
                }))
            # else:
            #     # retorna erro que nao existe
            #     print("tá vazio")
        except ObjectDoesNotExist:
            print("Either the entry or blog doesn't exist.")

            return Response({
                'success' : False,
                'msg' : "Nao encontrei ",
            })
    

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)
        

# class ObservationViewSet(viewsets.ModelViewSet):
#     queryset = Observation.objects.all()
#     serializer_class = ObservationSerializer
#     filter_fields = ('id', 'name', 'source', 'observations')
#     search_fields = ('id', 'name', 'filename',)
#
# class OrbitalParameterViewSet(viewsets.ModelViewSet):
#     queryset = Observation.objects.all()
#     serializer_class = ObservationSerializer
#     filter_fields = ('id', 'name', 'source', 'observations')
#     search_fields = ('id', 'name', 'filename',)