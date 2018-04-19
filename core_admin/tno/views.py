from django.shortcuts import render

from rest_framework import viewsets, response, mixins, filters

from rest_framework.permissions import IsAuthenticated, IsAdminUser

from rest_framework.decorators import list_route

from rest_framework.response import Response

from django.contrib.auth.models import User

from .serializers import UserSerializer, SkybotOutputSerializer

from .models import SkybotOutput

from .skybotoutput import FilterObjects

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """        
        if self.action == 'retrieve':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]


    def retrieve(self, request, pk=None):
        """
            este metodo serve para retornar informacoes do usuario logado e
            so retorna informacao se o id passado por 'i'
        """
        if pk == 'i':
            return response.Response(UserSerializer(request.user,
                context={'request':request}).data)

        return super(UserViewSet, self).retrieve(request, pk)


class SkybotOutputViewSet(viewsets.ModelViewSet):

    queryset = SkybotOutput.objects.select_related().all()
    serializer_class = SkybotOutputSerializer
    filter_fields = ('id', 'name', 'expnum',)
    search_fields = ('name', 'dynclass',)

    @list_route()
    def search(self, request):
        """ 

        """
        name = request.query_params.get('name', None)
        print("Search Objects By Name: %s" % name)

        if not name:
            return Response({
                'success': False,
                'msg': 'Parameter name is required.'
            })


        rows, count = FilterObjects().objects_by_name(name)       

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })

    
    @list_route()
    def objects(self, request):
        """ 

        """
        # Retrive Params
        objectTable = request.query_params.get('objectTable')

        magnitude = None
        if request.query_params.get('useMagnitude') and float(request.query_params.get('magnitude')) > 0:
            magnitude = float(request.query_params.get('magnitude'))

        diffDateNights = None
        if request.query_params.get('useDifferenceTime') and float(request.query_params.get('diffDateNights')) > 0:
            diffDateNights = float(request.query_params.get('diffDateNights'))

        moreFilter = request.query_params.get('moreFilter')


        rows, count = FilterObjects().get_objects(
                        objectTable, magnitude, diffDateNights, moreFilter)       

        print(rows)

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })