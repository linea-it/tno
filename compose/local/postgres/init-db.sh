#!/bin/bash
set -e

# Create Database for apache airfloe
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE $AIRFLOW_DB WITH OWNER $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE $AIRFLOW_DB TO $POSTGRES_USER;
EOSQL

# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     CREATE SCHEMA tap_schema AUTHORIZATION $POSTGRES_USER;
#     CREATE SCHEMA tap_upload AUTHORIZATION $POSTGRES_USER;
#     CREATE SCHEMA oai_schema AUTHORIZATION $POSTGRES_USER;
# EOSQL

# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     CREATE EXTENSION q3c;
#     SELECT q3c_version();
# EOSQL


# # Create Table DR2 SAMPLE SCHEMA
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     \i /data/des_dr2_sample.sql;
# EOSQL
# # -- CREATE INDEX coadd_objects_ra_dec ON des_dr2.coadd_objects USING btree (q3c_ang2ipix(ra, "dec"));

# # Create Table GAIA SAMPLE SCHEMA
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "daiquiri_data" <<-EOSQL
#     \i /data/gaia_dr2_sample.sql;
# EOSQL
