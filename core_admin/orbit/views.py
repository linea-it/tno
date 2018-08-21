from django.shortcuts import render
from rest_framework import viewsets
from .models import OrbitRun
from .serializers import OrbitRunSerializer
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
import os
from .models import OrbitRun, RefinedAsteroid, RefinedOrbit, RefinedOrbitInput
from .serializers import OrbitRunSerializer, RefinedAsteroidSerializer, RefinedOrbitSerializer, \
    RefinedOrbitInputSerializer
from rest_framework.decorators import list_route
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
import os
import zipfile
from django.conf import settings
import urllib.parse


class OrbitRunViewSet(viewsets.ModelViewSet):
    queryset = OrbitRun.objects.all()
    serializer_class = OrbitRunSerializer
    filter_fields = ('id', 'owner', 'status',)
    search_fields = ('id',)
    ordering_fields = ('id', 'owner', 'status', 'start_time', 'finish_time')
    ordering = ('-start_time',)

    @list_route()
    def log_by_objects(self, request):
        name = request.query_params.get('name')
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
            result = dict({
                'lines': list(),
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
                'success': False,
                'msg': "Nao encontrei ",
            })

    def perform_create(self, serializer):
        # Adiconar usuario logado
        if not self.request.user.pk:
            raise Exception('It is necessary an active login to perform this operation.')
        serializer.save(owner=self.request.user)
        


class RefinedAsteroidViewSet(viewsets.ModelViewSet):
    queryset = RefinedAsteroid.objects.all()
    serializer_class = RefinedAsteroidSerializer
    filter_fields = ('id', 'orbit_run', 'name', 'number', 'status')
    search_fields = ('id', 'name', 'number',)
    ordering = ('name',)

    @list_route()
    def get_log(self, request):
        id = request.query_params.get('asteroid_id', None)

        log_path = None

        asteroid = None

        if id is not None:

            try:
                asteroid = RefinedAsteroid.objects.get(id=int(id))

            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with id %s Not Found." % id,
                })

        else:
            name = request.query_params.get('name', None)
            run = request.query_params.get('orbit_run', None)

            try:
                asteroid = RefinedAsteroid.objects.get(name=str(name), orbit_run=int(run))
            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with name %s and Orbit Run %s Not Found." % (name, run),
                })

        log_path = os.path.join(asteroid.relative_path, 'nima.log')
        if not os.path.exists(log_path):
            return Response({
                'success': False,
                'msg': "There is no log for asteroid %s." % asteroid.name,
            })

        try:
            new_lines = list()
            with open(log_path, 'r') as fp:
                lines = fp.readlines()
                for line in lines:
                    new_lines.append(line.strip())

                return Response(dict({
                    "success": True,
                    "lines": new_lines
                }))

        except Exception as e:
            return Response(dict({
                'success': False,
                'msg': 'Failed to read asteroid %s log' % asteroid.name
            }))

    @list_route()
    def get_neighbors(self, request):
        id = request.query_params.get('asteroid_id', None)

        if id is None:
            return Response({
                'success': False,
                'msg': "Asteroid with id %s Not Found." % id,
            })

        try:
            asteroid = RefinedAsteroid.objects.get(id=int(id))

        except ObjectDoesNotExist:
            return Response({
                'success': False,
                'msg': "Asteroid with id %s Not Found." % id,
            })

        next = None
        try:
            next_model = RefinedAsteroid.objects.filter(orbit_run=asteroid.orbit_run).exclude(status='failure').filter(
                id__gt=asteroid.id).order_by('id').first()
            next = next_model.id
        except:
            pass

        prev = None
        try:
            prev_model = RefinedAsteroid.objects.filter(orbit_run=asteroid.orbit_run).exclude(status='failure').filter(
                id__lt=asteroid.id).order_by('-id').first()
            prev = prev_model.id
        except:
            pass

        return Response(dict({
            "success": True,
            "prev": prev,
            "next": next
        }))

    @list_route()
    def download_results(self, request):
        id = request.query_params.get('asteroid_id', None)

        asteroid = None

        if id is not None:

            try:
                asteroid = RefinedAsteroid.objects.get(id=int(id))

            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with id %s Not Found." % id,
                })

        else:
            name = request.query_params.get('name', None)
            run = request.query_params.get('orbit_run', None)

            try:
                asteroid = RefinedAsteroid.objects.get(name=str(name), orbit_run=int(run))
            except ObjectDoesNotExist:
                return Response({
                    'success': False,
                    'msg': "Asteroid with name %s and Orbit Run %s Not Found." % (name, run),
                })

        results_path = asteroid.relative_path

        if not os.path.exists(results_path) and not os.path.isdir(results_path):
            return Response(dict({
                'success': False,
                'msg': 'Failed to find asteroid %s results' % asteroid.name
            }))

        zipname = "%s.zip" % asteroid.name.replace(" ", "_")

        zip_file = os.path.join(settings.MEDIA_TMP_DIR, zipname)

        with zipfile.ZipFile(zip_file, 'w') as ziphandle:
            for root, dirs, files in os.walk(results_path):
                for file in files:
                    origin_file = os.path.join(root, file)
                    ziphandle.write(origin_file, arcname=file)

        ziphandle.close()

        if not os.path.exists(zip_file):
            return Response(dict({
                'success': False,
                'msg': 'Failed to create zip file'
            }))

        src = urllib.parse.urljoin(settings.MEDIA_TMP_URL, zipname)

        return Response(dict({
            "success": True,
            "src": src
        }))

    @list_route()
    def get_orbital_parameters(self, request):
        id = request.query_params.get('asteroid_id', None)

        print("Orbital parameters: %s" % id)

        return Response(dict({
            "success": True,
        }))


class RefinedOrbitViewSet(viewsets.ModelViewSet):
    queryset = RefinedOrbit.objects.all()
    serializer_class = RefinedOrbitSerializer
    filter_fields = ('id', 'filename', 'asteroid')
    search_fields = ('id', 'filename')
    ordering = ('filename', 'file_type')


class RefinedOrbitInputViewSet(viewsets.ModelViewSet):
    queryset = RefinedOrbitInput.objects.all()
    serializer_class = RefinedOrbitInputSerializer
    filter_fields = ('id', 'asteroid', 'input_type', 'filename')
    search_fields = ('id', 'filename')
    ordering = ('input_type')
