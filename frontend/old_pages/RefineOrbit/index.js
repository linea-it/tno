import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  CardHeader,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
  Icon,
  Grid,
} from '@material-ui/core';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import useInterval from '../../hooks/useInterval';
import { getPraiaRuns } from '../../services/api/Praia';
import { getOrbitRuns, createOrbitRun } from '../../services/api/Orbit';
import '@fortawesome/fontawesome-free/css/all.min.css';

function RefineOrbit({ setTitle }) {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [inputData, setInputData] = useState([]);
  const pageSizes = [5, 10, 15];
  const [select, setSelect] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    setTitle('Refine Orbits');
  }, [setTitle]);

  return (
    <Grid container direction="row">
      <Grid item xs={12} md={4}>
        {/* <Card>
          <CardHeader title={<span>Execute</span>} />
          <CardContent>
          </CardContent>
        </Card>
      </Grid>
      <Grid>
        <Card>
          <CardHeader title={<span>History</span>} />
          <CardContent>
          </CardContent>
        </Card> */}
      </Grid>
    </Grid>
  );
}

RefineOrbit.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default RefineOrbit;
