from rest_framework import viewsets, response, mixins

import humanize
from django.contrib.auth.models import User
from rest_framework import viewsets, response, mixins
from rest_framework.decorators import list_route
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Pointing, SkybotOutput, CustomList, Proccess
from .serializers import UserSerializer, PointingSerializer, SkybotOutputSerializer, ObjectClassSerializer, \
    CustomListSerializer, ProccessSerializer
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
                                                    context={'request': request}).data)

        return super(UserViewSet, self).retrieve(request, pk)


class PointingViewSet(viewsets.ModelViewSet):
    queryset = Pointing.objects.all()
    serializer_class = PointingSerializer
    filter_fields = ('id', 'desfile_id', 'expnum', 'band', 'exptime', 'date_obs', 'downloaded')
    search_fields = ('id', 'filename', 'desfile_id', 'expnum')
    ordering_fields = ('id', 'expnum', 'date_obs', 'nite')
    ordering = ('-date_obs',)


class SkybotOutputViewSet(viewsets.ModelViewSet):
    queryset = SkybotOutput.objects.select_related().all()
    serializer_class = SkybotOutputSerializer
    filter_fields = ('id', 'name', 'expnum', 'dynclass','mv')
    search_fields = ('name', 'dynclass', 'num')

    @list_route()
    def objects(self, request):
        """

        """
        # Retrive Params

        name = request.query_params.get('name')

        objectTable = request.query_params.get('objectTable')

        magnitude = None
        if request.query_params.get('useMagnitude') and float(request.query_params.get('magnitude')) > 0:
            magnitude = float(request.query_params.get('magnitude'))

        diffDateNights = None
        if request.query_params.get('useDifferenceTime') and float(request.query_params.get('diffDateNights')) > 0:
            diffDateNights = float(request.query_params.get('diffDateNights'))

        moreFilter = request.query_params.get('moreFilter')

        page = request.query_params.get('page', 1)
        pageSize = request.query_params.get('pageSize', self.pagination_class.page_size)

        rows, count = FilterObjects().get_objects(
            name, objectTable, magnitude, diffDateNights,
            moreFilter, int(page), int(pageSize))

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })


class ObjectClassViewSet(viewsets.GenericViewSet,
                         mixins.ListModelMixin):
    queryset = SkybotOutput.objects.select_related().order_by('dynclass').distinct('dynclass')
    serializer_class = ObjectClassSerializer
    # Turn off pagination Class
    pagination_class = None


class CustomListViewSet(viewsets.ModelViewSet):
    queryset = CustomList.objects.all()
    serializer_class = CustomListSerializer
    filter_fields = ('id', 'displayname', 'tablename', 'status')
    search_fields = ('displayname', 'description',)
    ordering_fields = ('id', 'displayname', 'tablename', 'status', 'creation_date')
    ordering = ('-creation_date',)

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)

    @list_route()
    def list_objects(self, request):
        """

        """
        # Retrive Params
        tablename = request.query_params.get('tablename')
        page = request.query_params.get('page', 1)
        pageSize = request.query_params.get('pageSize', self.pagination_class.page_size)

        # Retrieve Custom List
        customlist = CustomList.objects.get(tablename=tablename, status='success')

        rows, count = FilterObjects().list_objects_by_table(
            customlist.tablename, customlist.schema, page, pageSize)

        return Response({
            'success': True,
            "results": rows,
            "count": count
        })

    @list_route()
    def get_stats(self, request):
        # Retrive Params
        tablename = request.query_params.get('tablename', None)
        id = request.query_params.get('id', None)

        # Retrieve Custom List by tablename
        customlist = None
        if tablename is not None:
            customlist = CustomList.objects.get(tablename=tablename, status='success')
        elif id is not None:
            customlist = CustomList.objects.get(pk=id)

        serializer = self.serializer_class(customlist)

        data = serializer.data

        distinct_objects = FilterObjects().count_distinct_objects(
            customlist.tablename, customlist.schema)

        distinct_pointing = FilterObjects().count_distinct_pointing(
            customlist.tablename, customlist.schema)

        not_downloaded = FilterObjects().count_pointing_not_downloaded(
            customlist.tablename, customlist.schema
        )

        missing_pointing = FilterObjects().count_missing_pointing(
            customlist.tablename, customlist.schema)

        size_ccdimages = FilterObjects().count_ccdimage_size(
            customlist.tablename, customlist.schema)

        size_not_downloaded = (size_ccdimages / data.get("rows")) * not_downloaded

        data.update({
            'distinct_objects': distinct_objects,
            'distinct_pointing': distinct_pointing,
            'not_downloaded': not_downloaded,
            'missing_pointing': missing_pointing,
            'size_ccdimages': humanize.naturalsize(size_ccdimages),
            'size_not_downloaded': humanize.naturalsize(size_not_downloaded)
        })

        return Response({
            'success': True,
            'data': data
        })


class ProccessViewSet(viewsets.ModelViewSet):
    queryset = Proccess.objects.all()
    serializer_class = ProccessSerializer
    filter_fields = ('id',)
    search_fields = ('id',)

