FROM debian:buster-slim as base
# FROM ubuntu:20.04 as base

ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV PATH /opt/conda/bin:$PATH

# Instalacao do Gfortran 7 e Miniconda
RUN set -x && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    gcc \
    gfortran-7 \
    ca-certificates \
    git \
    ssh \
    wget \
    rsync \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/conda \
    && wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O /opt/conda/miniconda.sh \
    && bash /opt/conda/miniconda.sh -b -u -p /opt/conda \
    && rm -rf /opt/conda/miniconda.sh \
    && /opt/conda/bin/conda init bash \
    && find /opt/conda/ -follow -type f -name '*.a' -delete \
    && find /opt/conda/ -follow -type f -name '*.js.map' -delete \
    && /opt/conda/bin/conda clean -afy \
    && chmod =2775 /opt/conda \
    && ln -s /opt/conda/etc/profile.d/conda.sh /etc/profile.d/conda.sh

# -------------- PRAIA OCC compile Stage --------------
FROM base as praia_occ
ADD praia_occ_src /tmp/praia_occ_src
RUN mkdir /tmp/praia_occ \
    && cd /tmp/praia_occ_src \
    && gfortran-7 geradata.f -o geradata spicelib.a \
    && mv geradata /tmp/praia_occ \
    && gfortran-7 elimina.f -o elimina \
    && mv elimina /tmp/praia_occ \
    && gfortran-7 PRAIA_occ_star_search_12.f -o PRAIA_occ_star_search_12 \
    && mv PRAIA_occ_star_search_12 /tmp/praia_occ \
    # 	&& gfortran-7 gerapositions.f -o gerapositions \
    # 	&& mv gerapositions /usr/local/bin/ \
    && cd ~/ \
    && rm -r /tmp/praia_occ_src

# # -------------- Python 2.7 Environment Stage --------------
# FROM base as py2_build
# COPY environment.py2.yml .
# RUN /bin/bash --login -c "conda init bash \
#     && source ~/.bashrc \
#     && conda env create -f environment.py2.yml \
#     && conda activate py2"

# -------------- Python 3.8 Environment Stage --------------
FROM base as py3_build
COPY environment.py3.yml .
RUN /bin/bash --login -c "conda init bash \
    && source ~/.bashrc \
    && conda env create -f environment.py3.yml \
    && conda activate py3"

# # -------------- Runtime Stage --------------
FROM base

# If this is set to a non-empty string, Python won’t try
# to write .pyc files on the import of source modules
ENV PYTHONDONTWRITEBYTECODE=1

# Force the stdout and stderr streams to be unbuffered.
# This option has no effect on the stdin stream.
ENV PYTHONUNBUFFERED=1

ENV BSP_PLANETARY_NAME=de440.bsp
ENV LEAP_SECOND_NAME=naif0012.tls

# Download da BSP planetary
# OBS. o Download demora bastante!
RUN wget --no-verbose --show-progress \
    --progress=bar:force:noscroll \
    https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/$BSP_PLANETARY_NAME

# Download Leap Second
RUN wget --no-verbose --show-progress \
    --progress=bar:force:noscroll \
    https://naif.jpl.nasa.gov/pub/naif/generic_kernels/lsk/$LEAP_SECOND_NAME

# PRAIA OCC binaries
COPY --from=praia_occ /tmp/praia_occ/* /usr/local/bin

# # Python 2.7 environment
# COPY --chown=:conda --chmod=775 --from=py2_build /opt/conda/envs/py2 /opt/conda/envs/py2

# Python 3.8 environment
COPY --chown=:conda --chmod=775 --from=py3_build /opt/conda/envs/py3 /opt/conda/envs/py3

RUN set -x && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    bash-completion \
    nano \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ARG APP_HOME=/app
ARG USERNAME=vscode
ARG USERUID=1000
ARG USERGID=1000

# Create remote user
# Create the conda group and add remote user to the group
RUN groupadd --gid ${USERGID} ${USERNAME} \
    && useradd --uid ${USERUID} --gid ${USERGID} --shell /bin/bash --create-home ${USERNAME} \
    && groupadd --gid 15010 ton \
    && useradd --uid 31670 --gid 15010 --shell /bin/bash --create-home apptno \
    && groupadd -r conda --gid 900 \
    && usermod -aG conda,ton ${USERNAME} \
    && usermod -aG conda apptno



ENV PIPELINE_ROOT=${APP_HOME}/src
ENV PIPELINE_PREDIC_OCC=${PIPELINE_ROOT}/predict_occultation
ENV PIPELINE_PATH=${PIPELINE_PREDIC_OCC}/pipeline
ENV PREDICT_OUTPUTS=${APP_HOME}/outputs/predict_occultation

# quando parsl_env = local o diretório remoto é o mesmo que o local.
# mas quando parsl_env = linea o diretório remoto é por ex: /lustre/t1/scratch/users/app.tno/tno_testing
ENV REMOTE_PIPELINE_ROOT=$PIPELINE_ROOT


COPY --chown=${USERNAME}:ton --chmod=775 src /app/src
COPY --chown=${USERNAME}:ton --chmod=775 entrypoint.sh ${APP_HOME}

# COPY --chown=${USERNAME}:ton --chmod=775 src ${PIPELINE_ROOT}
# COPY --chown=${USERNAME}:ton --chmod=775 src/predict_occultation ${PIPELINE_PREDIC_OCC}
# COPY --chown=${USERNAME}:ton --chmod=775 src ${PIPELINE_ROOT}
# COPY --chown=${USERNAME}:ton --chmod=775 predict_occultation ${PIPELINE_PREDIC_OCC}
# COPY --chown=${USERNAME}:ton --chmod=775 rerun.py ${APP_HOME}
# COPY --chown=${USERNAME}:ton --chmod=775 rerun.sh ${APP_HOME}
# COPY --chown=${USERNAME}:ton --chmod=775 daemon.sh ${APP_HOME}
# COPY --chown=${USERNAME}:ton --chmod=775 entrypoint.sh ${APP_HOME}
# COPY --chown=${USERNAME}:ton --chmod=775 run_daemon.py ${APP_HOME}

RUN chmod =2775 ${PIPELINE_ROOT} \
    && chmod =2775 ${APP_HOME} \
    && mv de440.bsp ${PIPELINE_PATH}/$BSP_PLANETARY_NAME \
    && mv naif0012.tls ${PIPELINE_PATH}/$LEAP_SECOND_NAME

WORKDIR ${APP_HOME}

USER apptno
# RUN /bin/bash --login -c "conda init bash \
#     && echo 'conda activate py3' >> ~/.bashrc \
#     && source ~/.bashrc"
RUN /bin/bash --login -c "conda init bash \
    && echo 'source /app/src/env.sh' >> ~/.bashrc \
    && source ~/.bashrc"
ENV PATH=${PATH}:/home/apptno/.local/bin

# USER ${USERNAME}
# RUN /bin/bash --login -c "conda init bash \
#     && echo 'conda activate py3' >> ~/.bashrc \
#     && source ~/.bashrc"
USER ${USERNAME}
RUN /bin/bash --login -c "conda init bash \
    && echo 'source /app/src/env.sh' >> ~/.bashrc \
    && source ~/.bashrc"
ENV PATH=${PATH}:/home/${USERNAME}/.local/bin

ENTRYPOINT [ "./entrypoint.sh" ]
