import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Card, CardHeader, Button, Icon, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
/*
  TODO: This, under, is a very bad refactor!
  For now, I exported the component to another folder (where it should be)
  and, later on, I'll create one single component, generic, to suffice similar necessities.
*/
import SelectAstrometry from '../../components/Input/SelectAstrometry';

import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import {
  getListsByStatus,
  getCatalogs,
  getConfigurations,
  createPraiaRun,
  getPraiaRuns,
} from '../../services/api/Praia';

function Astrometry({ history, setTitle }) {
  const [objectList, setObjectList] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [valueSubmition, setValueSubmition] = useState({
    inputId: null,
    refCatalogId: null,
    configId: null,
  });
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const loadTableData = ({ pageSize, currentPage, searchValue }) => {
    setLoading(true);
    getPraiaRuns({ page: currentPage, pageSize, search: searchValue })
      .then((res) => {
        setTableData(res.results);
        setTotalCount(res.count);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClickHistoryTable = (row) => {
    history.push(`/astrometry/${row.id}`);
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: handleClickHistoryTable,
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      width: 150,
      align: 'center',
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'proccess_displayname',
      title: 'Process',
      width: 200,
      align: 'left',
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 150,
      align: 'left',
    },
    {
      name: 'input_displayname',
      title: 'Input',
      width: 100,
      align: 'right',
    },
    {
      name: 'configuration_displayname',
      title: 'Configuration',
      width: 150,
      align: 'right',
    },
    {
      name: 'start_time',
      title: 'Date',
      width: 180,
      customElement: (row) => (
        <span>
          {row.start_time
            ? moment(row.start_time).format('YYYY-MM-DD HH:mm:ss')
            : ''}
        </span>
      ),
      align: 'center',
    },
    {
      name: 'h_time',
      title: 'Start',
      width: 150,
      align: 'center',
    },
    {
      name: 'execution_time',
      title: 'Exec Time',
      headerTooltip: 'Execution time',
      width: 100,
      customElement: (row) => (
        <span>
          {row.execution_time && typeof row.execution_time === 'string'
            ? row.execution_time.substring(0, 8)
            : ''}
        </span>
      ),
      align: 'center',
    },
    {
      name: 'count_objects',
      title: 'Asteroids',
      width: 100,
      align: 'right',
    },
  ];

  const loadData = (inputValue) => {
    getListsByStatus({ status: 'success', search: inputValue }).then((res) => {
      setObjectList(res.results);
    });

    getCatalogs({ search: inputValue }).then((res) => {
      setCatalogs(res.results);
    });

    getConfigurations({ search: inputValue, ordering: '-creation_date' }).then(
      (res) => {
        setConfigurations(res.results);
      }
    );
  };

  useEffect(() => {
    if (objectList.length > 0 && typeof objectList[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        inputId: objectList[0].id,
      });
    }
  }, [objectList]);

  useEffect(() => {
    if (catalogs.length > 0 && typeof catalogs[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        refCatalogId: catalogs[0].id,
      });
    }
  }, [catalogs]);

  useEffect(() => {
    if (configurations.length > 0 && typeof configurations[0] !== 'undefined') {
      setValueSubmition({
        ...valueSubmition,
        configId: configurations[0].id,
      });
    }
  }, [configurations]);

  useEffect(() => {
    setTitle('Astrometry');
    loadData();
  }, []);

  const handleSubmit = () => {
    createPraiaRun({
      input: valueSubmition.inputId,
      config: valueSubmition.configId,
      catalog: valueSubmition.refCatalogId,
    }).then((res) => {
      history.push(`/astrometry/${res.data.id}`);
    });

    // TODO: When submit Run go to the Run Detail screen
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={6}>
          <Grid item xs={12} lg={5}>
            <Card>
              <CardHeader title="Execute" />
              <SelectAstrometry
                title="Input Object List"
                case="input"
                display="el.displayname"
                data={objectList}
                default="noDefault"
                width="90%"
                marginTop={10}
                valueSubmition={valueSubmition}
                setSubmition={setValueSubmition}
              />
              <SelectAstrometry
                title="Reference Catalog"
                case="catalog"
                display="el.display_name"
                data={catalogs}
                width="90%"
                marginTop={10}
                valueSubmition={valueSubmition}
                setSubmition={setValueSubmition}
              />
              <SelectAstrometry
                title="Configuration"
                case="configuration"
                width="90%"
                data={configurations}
                display="el.displayname"
                marginTop={10}
                valueSubmition={valueSubmition}
                setSubmition={setValueSubmition}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={6}>
          <Grid item sm={12} xl={12}>
            <Card>
              <CardHeader title="History" />
              <Table
                columns={tableColumns}
                data={tableData}
                defaultSorting={[
                  { columnName: 'start_time', direction: 'desc' },
                ]}
                loadData={loadTableData}
                totalCount={totalCount}
                hasSearching={false}
                hasColumnVisibility={false}
              />
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

Astrometry.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  setTitle: PropTypes.func.isRequired,
};

export default withRouter(Astrometry);
