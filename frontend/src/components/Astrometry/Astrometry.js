import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Card, CardHeader, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import InputSelect from './InputSelectAstrometryMain';
import {
  getListsByStatus, getCatalogs, getConfigurations, createPraiaRun,
} from '../../api/Praia';
import AstrometryHistory from './AstrometryHistory';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
  },
  button: {
    margin: theme.spacing(1),
    float: 'right',
    marginRight: '5%',
  },
}));

function Astrometry({ history, setTitle }) {
  const classes = useStyles();

  const [objectList, setObjectList] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [reloadHistory, setReloadHistory] = useState(false);
  const [valueSubmition, setValueSubmition] = useState({
    inputId: null,
    refCatalogId: null,
    configId: null,
  });

  const loadData = (inputValue) => {
    getListsByStatus({ status: 'success', search: inputValue }).then((res) => {
      setObjectList(res.results);
    });

    getCatalogs({ search: inputValue }).then((res) => {
      setCatalogs(res.results);
    });

    getConfigurations({ search: inputValue, ordering: '-creation_date' }).then((res) => {
      setConfigurations(res.results);
    });
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
              <CardHeader
                className={classes.cardHeader}
                title="Execute"
              />
              <InputSelect
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
              <InputSelect
                title="Reference Catalog"
                case="catalog"
                display="el.display_name"
                data={catalogs}
                width="90%"
                marginTop={10}
                valueSubmition={valueSubmition}
                setSubmition={setValueSubmition}
              />
              <InputSelect
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
                className={classes.button}
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
              <CardHeader
                className={classes.cardHeader}
                title="History"
              />
              <AstrometryHistory
                reloadHistory={reloadHistory}
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
