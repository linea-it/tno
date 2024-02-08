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
        ),
    )

    # Total de Observações no DES para este asteroid.
    # referente a tabela des_observations.
    des_obs = models.IntegerField(
        verbose_name="des_obs",
        help_text="total DES observations for this asteroid.",
        default=0,
    )
    # Total de Ocultações para este asteroid.
    occultations = models.IntegerField(
        default=0,
        verbose_name="Occultations",
        help_text="Number of occultation events identified for this asteroid.",
    )

    # Indica a Origem das Observations pode ser AstDys ou MPC
    obs_source = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Observation Source",
        help_text="Observation data source, AstDys or MPC.",
    )

    # Indica a Origem dos Orbital Elements pode ser AstDys ou MPC
    orb_ele_source = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="Orbital Elements Source",
        help_text="Orbital Elements data source, AstDys or MPC.",
    )

    # Tempo de execução para um unico asteroid.
    # Não considera o tempo em que job ficou em idle nem o tempo de consolidação do job.
    exec_time = models.DurationField(
        verbose_name="exec_time",
        null=True,
        blank=True,
        help_text="Prediction pipeline runtime for this asteroid.",
    )

    # Mensagens de erro pode conter mais de uma separadas por ;
    messages = models.TextField(
        verbose_name="messages",
        null=True,
        blank=True,
        help_text="Error messages that occurred while running this asteroid, there may be more than one in this case will be separated by ;",
    )

    # TODO: REVER ESTES CAMPOS que seriam usados só no time profile

    # Etapa DES Observations
    des_obs_start = models.DateTimeField(
        verbose_name="DES Observations Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Start of the execution of the DES Observations step",
    )

    des_obs_finish = models.DateTimeField(
        verbose_name="DES Observations Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of the DES Observations stage",
    )

    des_obs_exec_time = models.DurationField(
        verbose_name="DES Observations Execution Time",
        null=True,
        blank=True,
        help_text="DES Observations step execution time in seconds.",
    )

    # Etapa Download BSP from JPL
    bsp_jpl_start = models.DateTimeField(
        verbose_name="BSP JPL start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Beginning of the JPL BSP Download step.",
    )

    bsp_jpl_finish = models.DateTimeField(
        verbose_name="BSP JPL finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of the Dwonload stage of the JPL BSP.",
    )

    bsp_jpl_dw_time = models.DurationField(
        verbose_name="BSP JPL download time",
        null=True,
        blank=True,
        help_text="BSP download time from JPL.",
    )

    # Etapa Download Observations from AstDys or MPC
    obs_start = models.DateTimeField(
        verbose_name="Observations Download Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Beginning of the Download stage of observations.",
    )

    obs_finish = models.DateTimeField(
        verbose_name="Observations Download Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of the Download stage of the observations.",
    )

    obs_dw_time = models.DurationField(
        verbose_name="Observations Download Time",
        null=True,
        blank=True,
        help_text="Observations download time.",
    )

    # Etapa Orbital Elements from AstDys or MPC
    orb_ele_start = models.DateTimeField(
        verbose_name="Orbital Elements Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Beginning of the Orbtial Elements Download stage.",
    )

    orb_ele_finish = models.DateTimeField(
        verbose_name="Orbital Elements Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of Orbital Elements Download step.",
    )

    orb_ele_dw_time = models.DurationField(
        verbose_name="Orbital Elements Download Time",
        null=True,
        blank=True,
        help_text="Orbital Elements download time.",
    )

    # Etapa Refinamento de Orbita (NIMA)
    ref_orb_start = models.DateTimeField(
        verbose_name="Refine Orbit Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Start of the Refine Orbit step.",
    )

    ref_orb_finish = models.DateTimeField(
        verbose_name="Refine Orbit Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of the Refine Orbit step.",
    )

    ref_orb_exec_time = models.DurationField(
        verbose_name="Refine Orbit execution time",
        null=True,
        blank=True,
        help_text="Refine Orbit runtime.",
    )

    # Etapa Predict Occultation (PRAIA Occ)
    pre_occ_start = models.DateTimeField(
        verbose_name="Predict Occultation Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Start of the Predict Occultation step.",
    )

    pre_occ_finish = models.DateTimeField(
        verbose_name="Predict Occultation Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of the Predict Occultation step.",
    )

    pre_occ_exec_time = models.DurationField(
        verbose_name="Predict Occultation Execution Time",
        null=True,
        blank=True,
        help_text="Predict Occultation runtime.",
    )

    # Etapa de Calculo do Path Coeff, é executado junto com a predição,
    # Mas por ser um pouco demorado é interessante ter o seu tempo separado.
    calc_path_coeff_start = models.DateTimeField(
        verbose_name="Calc Path Coeff Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Start of path coeff.",
    )

    calc_path_coeff_finish = models.DateTimeField(
        verbose_name="Calc Path Coeff Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of path coeff.",
    )

    calc_path_coeff_exec_time = models.DurationField(
        verbose_name="Calc Path Coeff Execution Time",
        null=True,
        blank=True,
        help_text="Execution time of the path coeff step.",
    )

    # Etapa de Ingestão de Resultados (prenchimento dessa tabela e da tno_occultation)

    # Total de ocultações que foram inseridas no banco de dados
    # Deve ser igual a observations caso seja diferente indica que
    # houve falha no registro dos resultados
    # TODO: Talvez esse campo não seja necessário depois da fase de validação.
    ing_occ_count = models.IntegerField(
        default=0,
        verbose_name="Occultations Ingested",
        help_text="Total Occultations registered in the database.",
    )

    ing_occ_start = models.DateTimeField(
        verbose_name="Result Ingestion Start",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="Start recording the results.",
    )

    ing_occ_finish = models.DateTimeField(
        verbose_name="Result Ingestion Finish",
        auto_now_add=False,
        null=True,
        blank=True,
        help_text="End of record of results.",
    )

    ing_occ_exec_time = models.DurationField(
        verbose_name="Result Ingestion Execution Time",
        null=True,
        blank=True,
        help_text="Execution time of the results ingestion step.",
    )

    def __str__(self):
        return str(self.id)
