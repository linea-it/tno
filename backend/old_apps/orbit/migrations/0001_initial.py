# Generated by Django 2.0.12 on 2020-06-04 17:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("tno", "0001_initial"),
        ("praia", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BspJplFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
                        max_length=32,
                        unique=True,
                        verbose_name="Name",
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        blank=True,
                        help_text="Filename is formed by name without space and separated by underline.",
                        max_length=256,
                        null=True,
                        verbose_name="Filename",
                    ),
                ),
                (
                    "download_start_time",
                    models.DateTimeField(
                        auto_now_add=True, null=True, verbose_name="Download Start"
                    ),
                ),
                (
                    "download_finish_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Download finish"
                    ),
                ),
                (
                    "file_size",
                    models.PositiveIntegerField(
                        blank=True,
                        default=None,
                        help_text="File Size in bytes",
                        null=True,
                        verbose_name="File Size",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="ObservationFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
                        max_length=32,
                        unique=True,
                        verbose_name="Name",
                    ),
                ),
                (
                    "source",
                    models.CharField(
                        choices=[("MPC", "MPC"), ("AstDys", "AstDys")],
                        max_length=6,
                        verbose_name="Source",
                    ),
                ),
                (
                    "observations",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of Observations for this object or number of lines in the file.",
                        null=True,
                        verbose_name="Observations",
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        blank=True,
                        help_text="Filename is formed by name without space and separated by underline.",
                        max_length=256,
                        null=True,
                        verbose_name="Filename",
                    ),
                ),
                (
                    "download_start_time",
                    models.DateTimeField(
                        auto_now_add=True, null=True, verbose_name="Download Start"
                    ),
                ),
                (
                    "download_finish_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Download finish"
                    ),
                ),
                (
                    "file_size",
                    models.PositiveIntegerField(
                        blank=True,
                        default=None,
                        help_text="File Size in bytes",
                        null=True,
                        verbose_name="File Size",
                    ),
                ),
                (
                    "external_url",
                    models.URLField(
                        blank=True,
                        help_text="File Url in the original service.",
                        null=True,
                        verbose_name="External URL",
                    ),
                ),
                (
                    "download_url",
                    models.URLField(
                        blank=True,
                        help_text="Url used to download file.",
                        null=True,
                        verbose_name="Download URL",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="OrbitalParameterFile",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
                        max_length=32,
                        unique=True,
                        verbose_name="Name",
                    ),
                ),
                (
                    "source",
                    models.CharField(
                        choices=[("MPC", "MPC"), ("AstDys", "AstDys")],
                        max_length=6,
                        verbose_name="Source",
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        blank=True,
                        help_text="Filename is formed by name without space and separated by underline.",
                        max_length=256,
                        null=True,
                        verbose_name="Filename",
                    ),
                ),
                (
                    "download_start_time",
                    models.DateTimeField(
                        auto_now_add=True, null=True, verbose_name="Download Start"
                    ),
                ),
                (
                    "download_finish_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Download finish"
                    ),
                ),
                (
                    "file_size",
                    models.PositiveIntegerField(
                        blank=True,
                        default=None,
                        help_text="File Size in bytes",
                        null=True,
                        verbose_name="File Size",
                    ),
                ),
                (
                    "external_url",
                    models.URLField(
                        blank=True,
                        help_text="File Url in the original service.",
                        null=True,
                        verbose_name="External URL",
                    ),
                ),
                (
                    "download_url",
                    models.URLField(
                        blank=True,
                        help_text="Url used to download file.",
                        null=True,
                        verbose_name="Download URL",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="OrbitRun",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "start_time",
                    models.DateTimeField(
                        auto_now_add=True, null=True, verbose_name="Start Time"
                    ),
                ),
                (
                    "finish_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Finish Time"
                    ),
                ),
                (
                    "execution_time",
                    models.DurationField(
                        blank=True, null=True, verbose_name="Execution Time"
                    ),
                ),
                (
                    "execution_download_time",
                    models.DurationField(
                        blank=True, null=True, verbose_name="Execution Download Time"
                    ),
                ),
                (
                    "execution_nima_time",
                    models.DurationField(
                        blank=True, null=True, verbose_name="Execution NIMA Time"
                    ),
                ),
                (
                    "average_time",
                    models.FloatField(
                        blank=True, null=True, verbose_name="Average Time"
                    ),
                ),
                (
                    "count_objects",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of objects received as input",
                        null=True,
                        verbose_name="Num Objects",
                    ),
                ),
                (
                    "count_executed",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of objects that were executed by NIMA.",
                        null=True,
                        verbose_name="Num Executed Objects",
                    ),
                ),
                (
                    "count_not_executed",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of objects that were NOT executed by NIMA.",
                        null=True,
                        verbose_name="Num Not Executed Objects",
                    ),
                ),
                (
                    "count_success",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of objects successfully executed",
                        null=True,
                        verbose_name="Count Success",
                    ),
                ),
                (
                    "count_failed",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of failed objects",
                        null=True,
                        verbose_name="Count Failed",
                    ),
                ),
                (
                    "count_warning",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of objects with status warning",
                        null=True,
                        verbose_name="Count Warning",
                    ),
                ),
                (
                    "relative_path",
                    models.CharField(
                        blank=True,
                        help_text="Path relative to the refine orbit directory, this is the internal path in the proccess directory.",
                        max_length=256,
                        null=True,
                        verbose_name="Relative Path",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("pending", "Pending"),
                            ("running", "Running"),
                            ("success", "Success"),
                            ("failure", "Failure"),
                        ],
                        default="pending",
                        max_length=10,
                        null=True,
                        verbose_name="Status",
                    ),
                ),
                (
                    "input_list",
                    models.ForeignKey(
                        blank=True,
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="input_list",
                        to="tno.CustomList",
                        verbose_name="Input List",
                    ),
                ),
                (
                    "input_praia",
                    models.ForeignKey(
                        blank=True,
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="praia_run",
                        to="praia.Run",
                        verbose_name="Praia Run",
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        blank=True,
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="owner",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Owner",
                    ),
                ),
                (
                    "proccess",
                    models.ForeignKey(
                        blank=True,
                        default=None,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="proccess",
                        to="tno.Proccess",
                        verbose_name="Proccess",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RefinedAsteroid",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        help_text="(ucd=“meta.id;meta.main”) Object name (official or provisional designation).",
                        max_length=32,
                        verbose_name="Name",
                    ),
                ),
                (
                    "number",
                    models.CharField(
                        blank=True,
                        default=None,
                        help_text="(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).",
                        max_length=6,
                        null=True,
                        verbose_name="Number",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("pending", "Pending"),
                            ("running", "Running"),
                            ("warning", "Warning"),
                            ("success", "Success"),
                            ("failure", "Failure"),
                            ("not_executed", "Not Executed"),
                            ("idle", "Idle"),
                        ],
                        default="pending",
                        max_length=15,
                        null=True,
                        verbose_name="Status",
                    ),
                ),
                (
                    "error_msg",
                    models.CharField(
                        blank=True,
                        help_text="When the status is failure, this field should contain a message with the error.",
                        max_length=256,
                        null=True,
                        verbose_name="Error Message",
                    ),
                ),
                (
                    "start_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Start Time"
                    ),
                ),
                (
                    "finish_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Finish Time"
                    ),
                ),
                (
                    "execution_time",
                    models.DurationField(
                        blank=True, null=True, verbose_name="Execution Time"
                    ),
                ),
                (
                    "relative_path",
                    models.CharField(
                        blank=True,
                        help_text="Path relative to the refine orbit OBJECT directory, this is the internal path in the proccess directory.",
                        max_length=256,
                        null=True,
                        verbose_name="Relative Path",
                    ),
                ),
                (
                    "absolute_path",
                    models.CharField(
                        blank=True,
                        help_text="Absolute Path to refine orbit OBJECT directory.",
                        max_length=1024,
                        null=True,
                        verbose_name="Absolute Path",
                    ),
                ),
                (
                    "orbit_run",
                    models.ForeignKey(
                        default=None,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="asteroids",
                        to="orbit.OrbitRun",
                        verbose_name="Orbit Run",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RefinedOrbit",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "type",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("bsp_nima", "BSP NIMA"),
                            ("residual_all_v1", "Residual All v1"),
                            ("residual_all_v2", "Residual All v2"),
                            ("residual_recent", "Residual Recent"),
                            ("comparison_nima_jpl_ra", "Comparison NIMA jpl RA"),
                            ("comparison_nima_jpl_dec", "Comparison NIMA jpl Dec"),
                            (
                                "comparison_bsp_integration",
                                "Comparison bsp integration",
                            ),
                            ("correl_mat", "correl.mat"),
                            ("sigyr_res", "sigyr.res"),
                            ("offset_oth_obs", "offset_oth.obs"),
                            ("ci_ast_dat", "CI_ast.dat"),
                            ("offset_oth_dat", "offset_oth.dat"),
                            ("ephemni_res", "ephemni.res"),
                            ("omc_ast_res", "omc_ast.res"),
                            ("ephembsp_res", "ephembsp.res"),
                            ("cov_mat", "cov.mat"),
                        ],
                        default=None,
                        help_text="Description of the result type.",
                        max_length=60,
                        null=True,
                        verbose_name="Type",
                    ),
                ),
                (
                    "filename",
                    models.CharField(
                        help_text="Filename is formed by name without space and separated by underline.",
                        max_length=256,
                        verbose_name="Filename",
                    ),
                ),
                (
                    "file_size",
                    models.PositiveIntegerField(
                        help_text="File Size in bytes", verbose_name="File Size"
                    ),
                ),
                (
                    "file_type",
                    models.CharField(
                        help_text="File extension like '.txt'",
                        max_length=10,
                        verbose_name="File Type",
                    ),
                ),
                (
                    "relative_path",
                    models.CharField(
                        blank=True,
                        help_text="Path relative to file, this is the internal path in the proccess directory.",
                        max_length=1024,
                        null=True,
                        verbose_name="Relative Path",
                    ),
                ),
                (
                    "asteroid",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="refined_orbit",
                        to="orbit.RefinedAsteroid",
                        verbose_name="Asteroid",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RefinedOrbitInput",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "input_type",
                    models.CharField(
                        choices=[
                            ("observations", "Observations"),
                            ("orbital_parameters", "Orbital Parameters"),
                            ("bsp_jpl", "BSP JPL"),
                            ("astrometry", "Astrometry"),
                        ],
                        help_text="Description of the input type.",
                        max_length=60,
                        verbose_name="Input Type",
                    ),
                ),
                (
                    "source",
                    models.CharField(
                        blank=True,
                        choices=[("MPC", "MPC"), ("AstDys", "AstDys"), ("JPL", "JPL")],
                        max_length=6,
                        null=True,
                        verbose_name="Source",
                    ),
                ),
                (
                    "date_time",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Date Time"
                    ),
                ),
                ("filename", models.CharField(max_length=256, verbose_name="Filename")),
                (
                    "relative_path",
                    models.CharField(
                        blank=True,
                        help_text="Path relative to file, this is the internal path in the proccess directory.",
                        max_length=1024,
                        null=True,
                        verbose_name="Relative Path",
                    ),
                ),
                (
                    "asteroid",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="input_file",
                        to="orbit.RefinedAsteroid",
                        verbose_name="Asteroid",
                    ),
                ),
            ],
        ),
        migrations.AlterUniqueTogether(
            name="refinedasteroid",
            unique_together={("orbit_run", "name")},
        ),
    ]