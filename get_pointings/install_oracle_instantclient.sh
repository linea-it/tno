#!/bin/sh
# Install Oracle Instant Client
unzip $APP_PATH/oracle/instantclient-basic-linux.x64-12.1.0.2.0.zip -d $APP_PATH/oracle
unzip $APP_PATH/oracle/instantclient-sdk-linux.x64-12.1.0.2.0.zip -d $APP_PATH/oracle
ls $APP_PATH/oracle

mv $APP_PATH/oracle/instantclient_12_1 /opt/oracle/instantclient
ln -s /opt/oracle/instantclient/libclntsh.so.12.1 /opt/oracle/instantclient/libclntsh.so
ln -s /opt/oracle/instantclient/libocci.so.12.1 /opt/oracle/instantclient/libocci.so

export ORACLE_HOME=/opt/oracle/instantclient
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$ORACLE_HOME
export OCI_HOME="/opt/oracle/instantclient"
export OCI_LIB_DIR="/opt/oracle/instantclient"
export OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"
