import math
from datetime import datetime, timedelta

import humanize
from django.db.models import Count
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from tno.models import BspPlanetary, Catalog, LeapSecond, PredictionJob
from tno.serializers import PredictionJobSerializer


@extend_schema(exclude=True)
class PredictionJobViewSet(
    mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    permission_classes = [IsAuthenticated]
    swagger_schema = None
    queryset = PredictionJob.objects.all()
    serializer_class = PredictionJobSerializer
    ordering_fields = (
        "id",
        "status",
        "owner",
        "start",
        "exec_time",
        "count_asteroids",
        "count_asteroids_with_occ",
        "count_occ",
        "count_success",
        "count_failures",
        "avg_exec_time",
    )
    ordering = ("-start",)

    @action(detail=False, methods=["post"])
    def submit_job(self, request, pk=None):
        """
        Este endpoint apenas cria um novo registro na tabela Prediction Jobs.

        O Job é criado com status idle. uma daemon verifica
        de tempos em tempos os jobs neste status e inicia o processamento.

        Parameters:
            date_initial: (string):

            date_final: (string):

            filter_type (string):

            filter_value (string):

            predict_step (inteiro):

        Returns:
            job (PredictionJobSerializer): Job que acabou de ser criado.
        """
        params = request.data
        date_initial = params["date_initial"]
        date_final = params["date_final"]
        debug = params["debug"]

        # Recuperar o usuario que submeteu o Job.
        owner = self.request.user

        # Calcular o intervalo da predição
        predictions_start = datetime.strptime(date_initial, "%Y-%m-%d")
        predictions_end = datetime.strptime(date_final, "%Y-%m-%d")
        predictons_interval = predictions_start - predictions_end
        h_predict_interval = humanize.naturaldelta(predictons_interval)

        catalog = Catalog.objects.get(id=int(params["catalog"]))
        planetary_ephemeris = BspPlanetary.objects.get(
            id=int(params["planetary_ephemeris"])
        )
        leap_second = LeapSecond.objects.get(id=int(params["leap_second"]))
        # Criar um model Prediction Job
        job = PredictionJob(
            owner=owner,
            # Job começa com Status Idle.
            status=1,
            submit_time=datetime.now(),
            filter_type=params["filter_type"],
            filter_value=params["filter_value"],
            predict_start_date=date_initial,
            predict_end_date=date_final,
            predict_step=params["predict_step"],
            catalog=catalog,
            planetary_ephemeris=planetary_ephemeris,
            leap_second=leap_second,
            predict_interval=h_predict_interval,
            debug=debug,
        )
        job.save()

        result = PredictionJobSerializer(job)

        return Response(result.data)

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):

        stages = []

        job = self.get_object()

        # Step 1 Submit tasks
        # ----------------------------------------------------
        total_asteroids = job.count_asteroids
        submited_tasks = job.predictionjobresult_set.count()
        stage1_queued = job.predictionjobresult_set.filter(status=3).count()
        stage1_failed = job.predictionjobresult_set.filter(status=2).count()

        stage1_avg_time = 0.0
        stage1_time_estimate = 0.0
        if job.start and submited_tasks > 0:
            from django.utils import timezone as tz

            now = tz.now()
            start = job.start if job.start.tzinfo else tz.make_aware(job.start)
            stage1_elapsed = (now - start).total_seconds()
            stage1_avg_time = stage1_elapsed / submited_tasks
            remaining_s1 = total_asteroids - submited_tasks
            if remaining_s1 > 0:
                stage1_time_estimate = stage1_avg_time * remaining_s1

        stage1_status = 3 if submited_tasks == total_asteroids else 2

        stages.append(
            {
                "step": 1,
                "task": "Data acquisition and preparation",
                "status": stage1_status,
                "count": total_asteroids,
                "current": submited_tasks,
                "average_time": stage1_avg_time,
                "time_estimate": stage1_time_estimate,
                "success": stage1_queued,
                "failures": stage1_failed,
                "updated": datetime.now().isoformat(),
            }
        )

        # Update job progress stage 2 - Running tasks
        # ----------------------------------------------------
        # tasks with status: 1 - Success, 2 - Failed, 5 - Aborted
        completed_tasks = job.predictionjobresult_set.filter(
            status__in=[1, 2, 5]
        ).count()

        success_tasks = job.predictionjobresult_set.filter(status=1).count()
        failed_tasks = job.predictionjobresult_set.filter(status=2).count()

        stage2_status = 3 if completed_tasks == submited_tasks else 2

        # Completed success tasks: exec_time and ing_occ_exec_time for run vs ingestion
        completed_success = job.predictionjobresult_set.filter(
            status__in=[1]
        ).values_list("exec_time", "ing_occ_exec_time")
        exec_seconds = []
        run_seconds = []
        ing_seconds_list = []
        for exec_t, ing_t in completed_success:
            e = (
                exec_t.total_seconds()
                if isinstance(exec_t, timedelta)
                else float(exec_t or 0)
            )
            i = (
                ing_t.total_seconds()
                if isinstance(ing_t, timedelta)
                else float(ing_t or 0)
            )
            if exec_t is not None:
                exec_seconds.append(e)
                run_seconds.append(e - i)
                ing_seconds_list.append(i)
        n = len(exec_seconds)
        avg_exec_time = sum(exec_seconds) / n if n else 0.0
        if n > 1:
            variance = sum((x - avg_exec_time) ** 2 for x in exec_seconds) / (n - 1)
            std_exec_time = variance**0.5
        else:
            std_exec_time = 0.0

        avg_ing_occ_time = (
            sum(ing_seconds_list) / len(ing_seconds_list) if ing_seconds_list else 0.0
        )
        if len(run_seconds) > 1:
            avg_run = sum(run_seconds) / len(run_seconds)
            var_run = sum((x - avg_run) ** 2 for x in run_seconds) / (
                len(run_seconds) - 1
            )
            std_run = var_run**0.5
        else:
            avg_run = sum(run_seconds) / len(run_seconds) if run_seconds else 0.0
            std_run = 0.0

        remaining_tasks = submited_tasks - completed_tasks
        time_estimate = 0.0
        if remaining_tasks > 0:
            time_per_run = avg_run + 3.0 * std_run
            running_tasks = job.predictionjobresult_set.filter(status=4).count()
            ingesting_tasks = job.predictionjobresult_set.filter(status=6).count()
            effective_parallelism = max(1, running_tasks)
            num_waves = math.ceil(remaining_tasks / effective_parallelism)
            time_estimate = (
                time_per_run * num_waves + avg_ing_occ_time * ingesting_tasks
            )

        stages.append(
            {
                "step": 2,
                "task": "Predict Occultation",
                "status": stage2_status,
                "count": submited_tasks,
                "current": completed_tasks,
                "average_time": avg_exec_time,
                "time_estimate": time_estimate,
                "success": success_tasks,
                "failures": failed_tasks,
                "updated": datetime.now().isoformat(),
            }
        )

        # count grouped tasks by status
        tasks_status_count = job.predictionjobresult_set.values("status").annotate(
            count=Count("status")
        )

        task_status_template = {
            1: {"status": 1, "label": "Success", "count": 0, "color": "success"},
            2: {"status": 2, "label": "Failed", "count": 0, "color": "error"},
            3: {"status": 3, "label": "Queued", "count": 0},
            4: {"status": 4, "label": "Running", "count": 0, "color": "primary"},
            5: {"status": 5, "label": "Aborted", "count": 0, "color": "secondary"},
            6: {"status": 6, "label": "Ingesting", "count": 0, "color": "primary"},
        }

        tasks_status = []
        for task in tasks_status_count:
            status = task_status_template.get(task["status"])
            status["count"] = task["count"]
            tasks_status.append(status)

        result = {
            "job_id": job.id,
            "asteroids": total_asteroids,
            "tasks_status": tasks_status,
            "progress": stages,
            "updated": datetime.now().isoformat(),
        }
        return Response(result)

    @action(detail=True, methods=["post"])
    def cancel_job(self, request, pk=None):
        """
        Sinaliza o pedido de cancelamento um Prediction job, alterando status para aborting
        """
        job = self.get_object()
        # Se o job estiver idle=1 ou running=2
        if job.status <= 2:
            # Marca o job como 7-Aborting
            job.status = 7
            job.save()

            # Alterar todas as tasks do job para aborting
            # 3-Queued
            tasks = job.predictionjobresult_set.filter(status=3)
            tasks.update(status=5)

            # Verificar se tem alguma task em execução
            # se não tiver altera o status direto para 5-Aborted
            tasks = job.predictionjobresult_set.filter(status=4)
            if len(tasks) == 0:
                job.status = 5
                job.save()
        result = PredictionJobSerializer(job)
        return Response(result.data)
