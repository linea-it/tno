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
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
} from '@material-ui/icons';
import moment from 'moment';
import DateRangePicker from '../../components/Date/DateRangePicker';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
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

  return (
    <>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={4} lg={3}>
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
                            <InputLabel>Data Input</InputLabel>
                            <Select label="Data Input">
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
                      <DateRangePicker
                        minDate={new Date('2012-11-10 04:09')}
                        maxDate={new Date('2019-02-28 00:00')}
                        selectedDate={['', '']}
                        setSelectedDate={() => {}}
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

        <Grid item xs={12} md={8} lg={9}>
          <Card>
            <CardHeader title="Progress" />
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
            title="Selection Criteria"
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
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Catalog</InputLabel>
                  <Select label="Catalog">
                    <MenuItem value="GAIA DR2">GAIA DR2</MenuItem>
                    <MenuItem value="GAIA DR3">GAIA DR3</MenuItem>
                    <MenuItem value="LSST">LSST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Radius Search (arcsec)"
                  type="number"
                  placeholder="0.15"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Leap Second Kernel"
                  placeholder="naif0012"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Planetary Ephemeris"
                  placeholder="DE435"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Ephemeris Step (Sec)"
                  type="number"
                  placeholder="600"
                  fullWidth
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}

export default RefineOrbit;
