import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { getPredictionJobResultById } from '../../services/api/PredictJobs';
import List from '../../components/List';
import { PredictionEventsContext } from '../../contexts/PredictionContext';
import PredictionEventsDataGrid from '../../components/PredictionEventsDataGrid/index';

function PredictionAsteroid() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Changed initial state to null for better type safety
  const [predictionJobResult, setPredictionJobResult] = useState(null);

  const [summary, setSummary] = useState([]);
  const [times, setTimes] = useState([]);

  const { setQueryOptions } = useContext(PredictionEventsContext);

  useEffect(() => {
    getPredictionJobResultById(id)
      .then((res) => {
        // Check if the response is valid before using it
        if (res) {
          setPredictionJobResult(res);
          setQueryOptions((prev) => {
            return {
              ...prev,
              filters: {
                ...prev.filters,
                filterType: 'name',
                filterValue: [{ name: res.name }],
                jobid: res.job,
                maginitudeMax: undefined,
                nightside: false,
                geo: false,
                date_time_after: undefined,
                date_time_before: undefined,
                solar_time_after: undefined,
                solar_time_before: undefined,
                closestApproachUncertainty: undefined,
              },
            };
          });
        } else {
          // Handle case where no result was found for the given ID
          setPredictionJobResult(null);
        }
      })
      .catch((error) => {
        // Catch network or server errors to prevent crashing
        console.error("Failed to fetch prediction job result:", error);
        setPredictionJobResult(null);
      });
  }, [id, setQueryOptions]);

  useEffect(() => {
    if (predictionJobResult) {
      setSummary([
        {
          title: 'Status',
          value: predictionJobResult.status_name,
        },
        {
          title: 'Name',
          value: predictionJobResult.name,
        },
        {
          title: 'Number',
          value: predictionJobResult.number,
        },
        {
          title: 'Dynamic class',
          value: predictionJobResult.base_dynclass,
        },
        {
          title: '# Occultations',
          value: predictionJobResult.occultations,
        },
        {
          title: '# Stars',
          value: predictionJobResult.stars,
        },
      ]);
      setTimes([
        {
          title: 'Execution time',
          value: predictionJobResult.exec_time ? predictionJobResult.exec_time.split('.')[0] : '-',
        },
        {
          title: 'Predict Occultation Execution Time',
          value: predictionJobResult.pre_occ_exec_time ? predictionJobResult.pre_occ_exec_time.split('.')[0] : '-',
        },
        {
          title: 'Path Coeff Execution Time',
          value: predictionJobResult.calc_path_coeff_exec_time ? predictionJobResult.calc_path_coeff_exec_time.split('.')[0] : '-',
        },
        {
          title: 'Result Ingestion Execution Time',
          value: predictionJobResult.ing_occ_exec_time ? predictionJobResult.ing_occ_exec_time.split('.')[0] : '-',
        },
      ]);
    }
  }, [predictionJobResult]);

  const handleBackNavigation = () => navigate(-1);

  const loadingCard = (height) => {
    return (
      <Skeleton
        height={height}
        animation="wave"
        sx={{
          paddingTop: 0,
          paddingBotton: 0,
        }}
      />
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" title="Back" onClick={handleBackNavigation}>
              <Icon className="fas fa-undo" fontSize="inherit" />
              <Typography variant="button" sx={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {predictionJobResult &&
        'messages' in predictionJobResult &&
        predictionJobResult.status === 2 &&
        predictionJobResult.messages !== null && (
          <Grid item xs={12}>
            <Alert severity="error">{predictionJobResult?.messages}</Alert>
          </Grid>
        )}
      <Grid item xs={6}>
        {!predictionJobResult && loadingCard(400)}
        {predictionJobResult && (
          <Card>
            <CardHeader title="Summary" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent>
              <List data={summary} />
            </CardContent>
          </Card>
        )}
      </Grid>
      <Grid item xs={6}>
        {!predictionJobResult && loadingCard(400)}
        {predictionJobResult && (
          <Card>
            <CardHeader title="Execution Statistics" titleTypographyProps={{ variant: 'h6' }} />
            <CardContent>
              <List data={times} />
            </CardContent>
          </Card>
        )}
      </Grid>
      <Grid item xs={12} sx={{ mt: 2 }}>
        {!predictionJobResult && loadingCard(600)}
        {predictionJobResult && <PredictionEventsDataGrid disabledSearch />}
      </Grid>
    </Grid>
  );
}

export default PredictionAsteroid;
