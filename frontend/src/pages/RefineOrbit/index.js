import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Backdrop,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  Divider,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@material-ui/icons';
import moment from 'moment';
import { startOfYear, addYears } from 'date-fns';
import DateRangerPicker from '../../components/Date/DateRangerPicker';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import Tabs from '../../components/Tabs';
import { useTitle } from '../../contexts/title';
import useStyles from './styles';

import { getAllObjects } from '../../services/api/Download';

function RefineOrbit() {
  const { setTitle } = useTitle();
  const classes = useStyles();
  const history = useHistory();

  const [backdropOpen, setBackdropOpen] = useState(false);
  const [dynclass, setDynclass] = useState('');
  const [objects, setObjects] = useState([]);
  const [object, setObject] = useState({});
  const [objectNameFocus, setObjectNameFocus] = useState(false);
  const [customConfOpen, setCustomConfOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(['', '']);

  useEffect(() => {
    setTitle('Refine Orbit (NIMA)');
  }, []);

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      width: 70,
    },
    {
      name: 'id',
      title: 'ID',
      width: 80,
    },
    {
      name: 'detail',
      title: 'Detail',
      width: 80,
      customElement: (row) => (
        <Button onClick={() => history.push(row.detail)}>
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
      title: 'Execution Date',
      width: 150,
      customElement: (row) => (
        <span title={moment(row.start).format('HH:mm:ss')}>
          {moment(row.start).format('YYYY-MM-DD')}
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
    {
      name: 'objects',
      title: '# Objects',
    },
  ];

  const tableData = [
    {
      id: 11,
      detail: `/refine-orbit/1`,
      status: 3,
      owner: 'mfreitas',
      start: '2021-03-26T17:05:52.277584Z',
      execution_time: '00:12:03.588550',
      objects: 1192,
    },
    {
      id: 15,
      detail: `/refine-orbit/2`,
      status: 3,
      owner: 'mfreitas',
      start: '2021-04-26T17:05:52.277584Z',
      execution_time: '00:12:04.588550',
      objects: 113,
    },
    {
      id: 16,
      detail: `/refine-orbit/2`,
      status: 4,
      owner: 'mfreitas',
      start: '2021-02-26T17:05:52.277584Z',
      execution_time: '00:07:04.588550',
      objects: 144,
    },
    {
      id: 18,
      detail: `/refine-orbit/2`,
      status: 2,
      owner: 'mfreitas',
      start: '2021-01-26T17:05:52.277584Z',
      execution_time: '00:02:04.588550',
      objects: 123,
    },
  ];

  useEffect(() => {
    getAllObjects().then((res) => {
      setObjects(res);
    });
  }, []);

  const handleDynClassChange = (e) => {
    setDynclass(e.target.value);
  };

  const handleChangeObject = (e, newValue) => {
    setObject(newValue);
  };

  const tabs = [
    {
      title: 'Options for observations and merging',
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked color="primary" />}
                label="Creation of observations file"
              />
              <FormControlLabel
                control={<Checkbox checked color="primary" />}
                label="Creation of orbital elements file"
              />
              <FormControlLabel
                control={<Checkbox checked color="primary" />}
                label="Merge all files"
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Timing Threashold for doublons (seconds)"
              type="number"
              defaultValue={60}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography color="primary" className={classes.tabSubtitle}>
              Type of Merging
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={<Radio color="primary" />}
                label="No merging, weight unchanged"
              />
              <FormControlLabel
                control={<Radio color="primary" />}
                label="Night merging, weight changed"
              />
              <FormControlLabel
                control={<Radio checked color="primary" />}
                label="No merging, weight changed"
              />
            </FormGroup>
          </Grid>
        </Grid>
      ),
    },
    {
      title: 'Fitting options',
      content: (
        <Grid container spacing={12}>
          <Grid item xs={12}>
            <Typography color="primary" className={classes.tabSubtitle}>
              Planet Perturbations
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={<Radio color="primary" />}
                label="no - 2body problem"
              />
              <FormControlLabel
                control={<Radio checked color="primary" />}
                label="Me,V,EMB,Mo,J,S,U,N"
              />
              <FormControlLabel
                control={<Radio color="primary" />}
                label="Me,V,T,L,Mo,J,S,U,N"
              />
              <FormControlLabel
                control={<Radio color="primary" />}
                label="Me,V,T,L,Mo,J,S,U,N,P"
              />
              <FormControlLabel
                control={<Radio color="primary" />}
                label="Me,V,EMB,Mo,J,S,U,N,P"
              />
            </FormGroup>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked color="primary" />}
              label="Fitting (not checked: O-C computation only)"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography color="primary" className={classes.tabSubtitle}>
              Weighting Process
            </Typography>

            <FormGroup row>
              <FormControlLabel
                control={<Radio color="primary" />}
                label="rms"
              />
              <FormControlLabel
                control={<Radio color="primary" />}
                label="rms constant"
              />
              <FormControlLabel
                control={<Radio checked color="primary" />}
                label="rms astdys"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Bias correction (bias in stellar catalogues)"
              type="number"
              defaultValue={1}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Number of fitting steps"
              type="number"
              defaultValue={6}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography color="primary" className={classes.tabSubtitle}>
              Rejection of Outliers
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={<Radio color="primary" />}
                label="Threshold values"
              />
              <FormControlLabel
                control={<Radio checked color="primary" />}
                label="Flag astdys"
              />
            </FormGroup>

            <TextField
              label="Threshold for outliers (arcsec)"
              type="number"
              defaultValue={3}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControlLabel
              control={<Checkbox checked color="primary" />}
              label="Plot of residuals"
            />
          </Grid>
        </Grid>
      ),
    },
  ];

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6} lg={5} xl={3}>
          <Grid container direction="column" spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Refine Orbit (NIMA)" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        <Grid
                          item
                          xs={12}
                          onClick={() => setObjectNameFocus(true)}
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
                                fullWidth
                                disabled={!objectNameFocus}
                              />
                            )}
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          onClick={() => setObjectNameFocus(false)}
                          className={classes.relativePosition}
                        >
                          {objectNameFocus ? (
                            <div className={classes.disabledArea} />
                          ) : null}
                          <FormControl fullWidth>
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
                              <MenuItem value="Mars-Crosser">
                                Mars-Crosser
                              </MenuItem>
                              <MenuItem value="MB">MB</MenuItem>
                              <MenuItem value="NEA">NEA</MenuItem>
                              <MenuItem value="Trojan">Trojan</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Data Origin</InputLabel>
                            <Select label="Data Origin">
                              <MenuItem value="DES">DES</MenuItem>
                              <MenuItem value="LSST">LSST</MenuItem>
                              <MenuItem value="ZTF">ZTF</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid container item xs={12} justify="flex-start">
                          <Button
                            // color="primary"
                            size="small"
                            component="label"
                            endIcon={<CloudUploadIcon />}
                            className={classes.fileInputBtn}
                            disableFocusRipple
                            disableTouchRipple
                            disableElevation
                            fullWidth
                          >
                            Upload User Data
                            <input type="file" hidden />
                            <Divider className={classes.fileInputDivider} />
                          </Button>
                        </Grid>

                        <Grid container item xs={12} justify="flex-end">
                          <Button
                            color="primary"
                            size="small"
                            onClick={() => setCustomConfOpen(true)}
                          >
                            Custom configuration
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        color="primary"
                        variant="h6"
                        align="center"
                        gutterBottom
                      >
                        Valid Period of Extrapolation
                      </Typography>
                      <DateRangerPicker
                        minDate={new Date()}
                        maxDate={startOfYear(addYears(new Date(), 50))}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        definedRangeFuture
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => {}}
                      >
                        Execute
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={6} lg={7} xl={9}>
          <Card>
            <CardHeader title="Observation Days" />
            <CardContent>{/* {renderExposurePlot()} */}</CardContent>
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
                totalCount={tableData.length}
                // loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={false}
                hasToolbar={false}
                defaultSorting={[{ columnName: 'id', direction: 'asc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        fullWidth
        maxWidth="sm"
        open={customConfOpen}
        onClose={() => setCustomConfOpen(false)}
      >
        <Card>
          <CardHeader
            title="Configuration Refine Orbit"
            action={
              <IconButton
                onClick={() => setCustomConfOpen(false)}
                color="primary"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            className={classes.dialogCardHeader}
          />
          <CardContent className={classes.tabCardContent}>
            <Tabs data={tabs} backgroundColor="primary" />
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}

export default RefineOrbit;
