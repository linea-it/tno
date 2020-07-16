import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  Typography,
  Snackbar,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import DateRangePicker from '../../components/Date/DateRangePicker';
import useInterval from '../../hooks/useInterval';
import {
  getDownloadJobs,
  getCCDCountByPeriodAndDynClass,
  createDownloadJob,
  getAllObjects,
} from '../../services/api/Download';
import CalendarExecutedCcd from '../../components/Chart/CalendarExecutedCcd';
import useStyles from './styles';

function Download({ setTitle }) {
  const history = useHistory();
  const classes = useStyles();
  const [totalCount, setTotalCount] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [dynclass, setDynclass] = useState('Centaur');
  const [objects, setObjects] = useState([]);
  const [object, setObject] = useState({});
  const [disableSubmit, setDisableSubmit] = useState(true);
  const [reload, setReload] = useState(true);
  const [allCcds, setAllCcds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(['', '']);
  const [ccdYears, setCcdYears] = useState([]);
  const [selectedCcdYear, setSelectedCcdYear] = useState('');
  const [ccdsOfYear, setCcdsOfYear] = useState([]);
  const [objectNameFocus, setObjectNameFocus] = useState(false);
  const [
    hasJobRunningOrIdleFeedback,
    setHasJobRunningOrIdleFeedback,
  ] = useState(false);

  useEffect(() => {
    setTitle('Download');
  }, [setTitle]);

  const handleSelectPeriodClick = () => {
    getCCDCountByPeriodAndDynClass(
      '2012-11-10',
      '2019-02-28',
      objectNameFocus ? object.dynclass.split('>')[0] : dynclass
    ).then((res) => {
      const selectedYears = res
        .map((year) => moment(year.date).format('YYYY'))
        .filter((year, i, yearArr) => yearArr.indexOf(year) === i);

      setCcdYears(selectedYears);
      setSelectedCcdYear(selectedYears[0]);
      setAllCcds(res);
    });

    setDisableSubmit(false);
  };

  useEffect(() => {
    handleSelectPeriodClick();
    setDisableSubmit(true);
  }, []);

  useEffect(() => {
    getAllObjects().then((res) => {
      setObjects(res);
    });
  }, []);

  useEffect(() => {
    if (selectedCcdYear !== '' && allCcds.length > 0) {
      const ccds = allCcds.filter(
        (ccd) => moment(ccd.date).format('YYYY') === selectedCcdYear
      );
      setCcdsOfYear(ccds);
    }
  }, [allCcds, selectedCcdYear]);

  const loadData = ({ sorting, pageSize, currentPage }) => {
    getDownloadJobs({
      page: currentPage + 1,
      pageSize,
      ordering: sorting,
    }).then((res) => {
      const { data } = res;

      setTableData(data.results);
      setTotalCount(data.count);
    });
  };

  const handleSubmit = () => {
    setDisableSubmit(true);

    createDownloadJob({
      date_initial: selectedDate[0],
      date_final: selectedDate.length === 1 ? selectedDate[0] : selectedDate[1],
      dynclass: objectNameFocus ? object.dynclass.split('>')[0] : dynclass,
      object_name: objectNameFocus ? object.name : null,
    })
      .then((response) => {
        const { id } = response.data;

        const hasStatusRunningOrIdle =
          tableData.filter((row) => [1, 2].includes(row.status)).length > 0;

        if (hasStatusRunningOrIdle) {
          setHasJobRunningOrIdleFeedback(true);
          setReload((prevState) => !prevState);
        } else {
          history.push(`/data-preparation/des/download/${id}`);
        }
      })
      .catch(() => {
        setReload((prevState) => !prevState);
        setDisableSubmit(false);
      });
  };

  const tableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 110,
      customElement: (row) => (
        <Button
          onClick={() =>
            history.push(`/data-preparation/des/download/${row.id}`)
          }
        >
          <InfoOutlinedIcon />
        </Button>
      ),
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'status',
      title: 'Status',
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'owner',
      title: 'Owner',
      width: 130,
    },
    {
      name: 'start',
      title: 'Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.start).format('HH:mm:ss')}>
          {moment(row.start).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      name: 'dynclass',
      title: 'Dynamic Class',
      width: 140,
    },
    {
      name: 'ccds',
      title: 'CCDs',
    },
    {
      name: 'date_initial',
      title: 'Initial Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.start).format('HH:mm:ss')}>
          {row.date_initial}
        </span>
      ),
    },
    {
      name: 'date_final',
      title: 'Final Date',
      width: 130,
      customElement: (row) => (
        <span title={moment(row.finish).format('HH:mm:ss')}>
          {row.date_final}
        </span>
      ),
    },
    {
      name: 'execution_time',
      title: 'Execution Time',
      width: 150,
      headerTooltip: 'Execution time',
      align: 'center',
      customElement: (row) =>
        row.execution_time ? row.execution_time.split('.')[0] : null,
    },
  ];

  const handleDynClassChange = (e) => {
    setDynclass(e.target.value);
  };

  const handleChangeObject = (e, newValue) => {
    setObject(newValue);
  };

  const handleNameClick = () => {
    setObjectNameFocus(true);
  };

  const handlePeriodClick = () => {
    setObjectNameFocus(false);
  };

  // Reload data if we have any Skybot job running,
  // so we can follow its progress in real time.
  useInterval(() => {
    const hasStatusRunning =
      tableData.filter((row) => row.status === 2).length > 0;

    if (hasStatusRunning) {
      setReload(!reload);
    }
  }, 10000);

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={4} lg={3}>
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Download Run" />
                <CardContent>
                  <Grid container spacing={2} alignItems="stretch">
                    <Grid
                      item
                      xs={12}
                      onClick={handleNameClick}
                      className={classes.relativePosition}
                    >
                      {!objectNameFocus ? (
                        <div className={classes.disabledArea} />
                      ) : null}
                      <Autocomplete
                        options={objects}
                        groupBy={(option) => option.dynclass}
                        getOptionLabel={(option) => option.name}
                        onChange={handleChangeObject}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Object Name"
                            variant="outlined"
                            className={classes.formControl}
                            disabled={!objectNameFocus}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      onClick={handlePeriodClick}
                      className={classes.relativePosition}
                    >
                      {objectNameFocus ? (
                        <div className={classes.disabledArea} />
                      ) : null}
                      <FormControl
                        variant="outlined"
                        className={classes.formControl}
                      >
                        <InputLabel>Dynamic Class</InputLabel>
                        <Select
                          label="Dynamic Class"
                          value={dynclass}
                          onChange={handleDynClassChange}
                          disabled={objectNameFocus}
                        >
                          <MenuItem value="Centaur">Centaur</MenuItem>
                          <MenuItem value="Hungaria">Hungaria</MenuItem>
                          <MenuItem value="KBO">KBO</MenuItem>
                          <MenuItem value="Mars-Crosser">Mars-Crosser</MenuItem>
                          <MenuItem value="MB">MB</MenuItem>
                          <MenuItem value="NEA">NEA</MenuItem>
                          <MenuItem value="Trojan">Trojan</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <DateRangePicker
                        // First day of Skybot:
                        minDate={new Date('2012-11-10 04:09')}
                        maxDate={new Date('2019-02-28 00:00')}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSelectPeriodClick}
                      >
                        Select
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Click here to submit a job on the selected period
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={disableSubmit}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
          <Card>
            <CardHeader title="Exposures By Period" />
            <CardContent>
              <Grid container spacing={2} alignItems="stretch">
                {ccdYears.length > 1 ? (
                  <Grid item>
                    <ButtonGroup
                      variant="contained"
                      color="primary"
                      className={classes.buttonGroupYear}
                    >
                      {ccdYears.map((year) => (
                        <Button
                          key={year}
                          onClick={() => setSelectedCcdYear(year)}
                          disabled={selectedCcdYear === year}
                        >
                          {year}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </Grid>
                ) : null}
                <Grid item xs={12}>
                  <CalendarExecutedCcd hoverTitle="object" data={ccdsOfYear} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="History" />
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                reload={reload}
                totalCount={totalCount}
                defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={hasJobRunningOrIdleFeedback}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="There's already a job running, so your job is currently idle."
        onClose={() => setHasJobRunningOrIdleFeedback(false)}
      />
    </>
  );
}

Download.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Download;
