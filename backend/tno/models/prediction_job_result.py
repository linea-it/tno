from django.db import models
from tno.models import Asteroid, PredictionJob


class PredictionJobResult(models.Model):

    job = models.ForeignKey(
        PredictionJob,
        on_delete=models.CASCADE,
        verbose_name="Prediction Job",
    )

    name = models.CharField(
        max_length=100,
        verbose_name="Asteroid Name",
    )

    number = models.CharField(
        max_length=100,
        verbose_name="Asteroid Number",
        null=True,
        blank=True,
    )

    base_dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid Base DynClass",
        # Default value only because this field is added after table already have data
        default="",
    )

    dynclass = models.CharField(
        max_length=100,
        verbose_name="Asteroid DynClass",
        # Default value only because this field is added after table already have data
        default="",
    )

    status = models.IntegerField(
        verbose_name="Status",
        default=1,
        choices=(
            (1, "Success"),
            (2, "Failed"),
            (3, "Queued"),
            (4, "Running"),
            (5, "Aborted"),
            (6, "Ingesting"),
        ),
    )

    # # Total de Observações no DES para este asteroid.
    # # referente a tabela des_observations.
    # des_obs = models.IntegerField(
    #     verbose_name="des_obs",
    #     help_text="total DES observations for this asteroid.",
    #     default=0,
    # )
    # Total de Ocultações para este asteroid.
    occultations = models.IntegerField(
        verbose_name="Occultations",
        help_text="Number of occultation events identified for this asteroid.",
        default=0,
        null=True,
        blank=True,
    )

    # Total de Estrelas processadas para este asteroid.
    stars = models.IntegerField(
        verbose_name="Stars",
        help_text="Number of stars processed for this asteroid.",
        default=0,
        null=True,
        blank=True,
    )

    # Tempo de execução para um unico asteroid.
    # Não considera o tempo em que job ficou em idle nem o tempo de consolidação do job.
    exec_time = models.DurationField(
        verbose_name="exec_time",
        help_text="Prediction pipeline runtime for this asteroid.",
        null=True,
        blank=True,
        default=0,
    )

    # Mensagens de erro pode conter mais de uma separadas por ;
    messages = models.TextField(
        verbose_name="messages",
        help_text="Error messages that occurred while running this asteroid, there may be more than one in this case will be separated by ;",
        null=True,
        blank=True,
        default=None,
    )

    # Etapa Predict Occultation (PRAIA Occ)
    pre_occ_start = models.DateTimeField(
        verbose_name="Predict Occultation Start",
        help_text="Start of the Predict Occultation step.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    pre_occ_finish = models.DateTimeField(
        verbose_name="Predict Occultation Finish",
        help_text="End of the Predict Occultation step.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    pre_occ_exec_time = models.DurationField(
        verbose_name="Predict Occultation Execution Time",
        help_text="Predict Occultation runtime.",
        null=True,
        blank=True,
    )

    # Etapa de Calculo do Path Coeff, é executado junto com a predição,
    # Mas por ser um pouco demorado é interessante ter o seu tempo separado.
    calc_path_coeff_start = models.DateTimeField(
        verbose_name="Calc Path Coeff Start",
        help_text="Start of path coeff.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    calc_path_coeff_finish = models.DateTimeField(
        verbose_name="Calc Path Coeff Finish",
        help_text="End of path coeff.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    calc_path_coeff_exec_time = models.DurationField(
        verbose_name="Calc Path Coeff Execution Time",
        help_text="Execution time of the path coeff step.",
        null=True,
        blank=True,
    )

    # Etapa de Ingestão de Resultados (prenchimento dessa tabela e da tno_occultation)

    # Total de ocultações que foram inseridas no banco de dados
    # Deve ser igual a observations caso seja diferente indica que
    # houve falha no registro dos resultados
    # TODO: Talvez esse campo não seja necessário depois da fase de validação.
    ing_occ_count = models.IntegerField(
        verbose_name="Occultations Ingested",
        help_text="Total Occultations registered in the database.",
        null=True,
        blank=True,
        default=0,
    )

    ing_occ_start = models.DateTimeField(
        verbose_name="Result Ingestion Start",
        help_text="Start recording the results.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    ing_occ_finish = models.DateTimeField(
        verbose_name="Result Ingestion Finish",
        help_text="End of record of results.",
        auto_now_add=False,
        null=True,
        blank=True,
    )

    ing_occ_exec_time = models.DurationField(
        verbose_name="Result Ingestion Execution Time",
        help_text="Execution time of the results ingestion step.",
        null=True,
        blank=True,
        default=0,
    )

    def __str__(self):
        return str(self.id)
