import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  CardHeader,
  Card,
  TextField,
  Button,
  Grid,
  Icon,
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

/*
TODO: These, under, are very bad refactor!
For now, I exported the components to another folder (where they should be)
and, later on, I'll create specific input components, generic, to suffice similar necessities.
*/
import SelectPredict from '../../components/Input/SelectPredict';
import DatePredict from '../../components/Input/DatePredict';

import {
  getPredictionRuns,
  getCatalogs,
  getLeapSeconds,
  getBspPlanetary,
  createPredictRun,
} from '../../services/api/Prediction';
import Table from '../../components/Table';
import { getOrbitRuns } from '../../services/api/Orbit';
import Dialog from '../../components/Dialog';
import ColumnStatus from '../../components/Table/ColumnStatus';

function PredictionOccultation({ setTitle }) {
  const history = useHistory();
  useEffect(() => {
    setTitle('Prediction of Occultations');
  }, [setTitle]);

  return (
    <Grid>
      <Grid container spacing={6}>

      </Grid>
    </Grid>
  );
}

PredictionOccultation.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default PredictionOccultation;
