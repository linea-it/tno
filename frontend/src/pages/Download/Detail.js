import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Icon,
  Button,
  Chip,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { useParams, useHistory } from 'react-router-dom';
import moment from 'moment';
import filesize from 'filesize';
import List from '../../components/List';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Progress from '../../components/Progress';
import {
  getDownloadProgress,
  getDownloadJobById,
  cancelDownloadJobById,
} from '../../services/api/Download';
import useInterval from '../../hooks/useInterval';
import useStyles from './styles';

function DownloadDetail({ setTitle }) {
  const { id } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const [summaryExecution, setSummaryExecution] = useState([]);
  const [summaryResults, setSummaryResults] = useState([]);
  const [progress, setProgress] = useState({
    status: 0,
    ccds: 0,
    t_executed: 0,
    t_size: 0,
    t_execution_time: 0,
    average_size: 0,
    average_time: 0,
    estimated_size: 0,
    estimated_time: 0,
  });
  const [loadProgress, setLoadProgress] = useState(false);
  const [isJobCanceled, setIsJobCanceled] = useState(false);
  const [hasCircularProgress, setHasCircularProgress] = useState(true);
  const [ccds, setCcds] = useState(0);

  const handleBackNavigation = () => history.goBack();

  useEffect(() => {
    setTitle('Download');
  }, [setTitle]);

  useEffect(() => {
    getDownloadProgress(id)
      .then((data) => {
        setProgress(data);

        if (![1, 2].includes(data.status)) {
          setHasCircularProgress(false);
        }
      })
      .catch(() => {
        setHasCircularProgress(true);
      });
  }, [loadProgress]);

  useEffect(() => {
    getDownloadJobById(id).then((res) => {
      setCcds(res.ccds);
      setSummaryExecution([
        {
          title: 'Status',
          value: () => (
            <ColumnStatus status={res.status} title={res.error_msg} />
          ),
        },
        {
          title: 'Owner',
          value: res.owner,
        },
        {
          title: 'Selected Period',
          value: `${moment(res.date_initial).format('YYYY-MM-DD')} / ${moment(
            res.date_final
          ).format('YYYY-MM-DD')}`,
        },
        {
          title: 'Start',
          value: moment(res.start).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: 'Finish',
          value: res.finish
            ? moment(res.finish).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        },
        {
          title: 'Execution',
          value: res.execution_time ? res.execution_time.split('.')[0] : 0,
        },
      ]);

      setSummaryResults([
        {
          title: 'Dynamic Class',
          value: res.dynclass,
        },
        {
          title: '# CCDs to Download',
          value: res.ccds_to_download,
        },
        {
          title: '# CCDs Downloaded',
          value: res.ccds_downloaded,
        },
        {
          title: 'Path',
          value: res.path,
        },
        {
          title: 'Size',
          value: filesize(res.t_size_downloaded),
        },
      ]);
    });
  }, [loadProgress]);

  const formatSeconds = (value) =>
    moment().startOf('day').seconds(value).format('HH:mm:ss');

  useInterval(() => {
    if ([1, 2].includes(progress.status)) {
      setLoadProgress((prevState) => !prevState);
    }
  }, [5000]);

  const handleStopRun = () => {
    cancelDownloadJobById(id).then(() => {
      setIsJobCanceled(true);
      setLoadProgress((prevState) => !prevState);
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              title="Back"
              onClick={handleBackNavigation}
            >
              <Icon className="fas fa-undo" fontSize="inherit" />
              <Typography variant="button" style={{ margin: '0 5px' }}>
                Back
              </Typography>
            </Button>
          </Grid>
          {[1, 2].includes(progress.status) ? (
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                title="Abort"
                onClick={handleStopRun}
                disabled={isJobCanceled}
              >
                {isJobCanceled ? (
                  <CircularProgress size={15} color="secondary" />
                ) : (
                  <Icon className="fas fa-stop" fontSize="inherit" />
                )}
                <Typography variant="button" style={{ margin: '0 5px' }}>
                  Abort
                </Typography>
              </Button>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
      {ccds === 0 && ![1, 2].includes(progress.status) ? (
        <Grid item xs={12}>
          <Typography variant="h6">
            No CCD was found or all CCDs were already downloaded in this period.
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item xs={12} md={5} xl={3}>
            <Card>
              <CardHeader title="Summary Execution" />
              <CardContent>
                <List data={summaryExecution} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7} xl={9}>
            <Card>
              <CardHeader title="Progress" />
              <CardContent>
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  className={classes.progressWrapper}
                >
                  <Grid item>
                    <Progress
                      title="Downloading CCDs"
                      variant="determinate"
                      label={`${progress.ccds} CCDs`}
                      total={progress.ccds}
                      current={progress.t_executed}
                    />
                    <Grid container spacing={2}>
                      <Grid item>
                        <Chip
                          label={`Average Time: ${progress.average_time.toFixed(
                            2
                          )}s`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item>
                        <Chip
                          label={`Average Size: ${filesize(
                            progress.average_size
                          )}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item>
                        <Chip
                          label={`Estimated Time: ${formatSeconds(
                            progress.estimated_time
                          )}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item>
                        <Chip
                          label={`Estimated Size: ${filesize(
                            progress.estimated_size
                          )}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item>
                        <Chip
                          label={`Progress: ${progress.t_executed}/${progress.ccds}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {hasCircularProgress && [1, 2].includes(progress.status) ? (
                    <CircularProgress
                      className={classes.circularProgress}
                      disableShrink
                      size={20}
                    />
                  ) : null}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5} xl={3}>
            <Card>
              <CardHeader title="Summary Results" />
              <CardContent>
                <List data={summaryResults} />
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
}

DownloadDetail.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default DownloadDetail;
