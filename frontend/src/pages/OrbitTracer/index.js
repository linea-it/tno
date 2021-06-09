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
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import {
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import moment from 'moment';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import { useTitle } from '../../contexts/title';
import useStyles from './styles';

import { getAllObjects } from '../../services/api/Download';

function OrbitTracer() {
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
    setTitle('Orbit Tracer');
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
      name: 'asteroids',
      title: '# SSOs',
    },
    {
      name: 'bsp_downloaded',
      title: 'BSP Downloaded',
      width: 150,
    },
  ];

  const tableData = [
    {
      id: 11,
      detail: `/data-preparation/des/orbit-tracer/1`,
      status: 3,
      owner: 'mfreitas',
      start: '2021-03-26T17:05:52.277584Z',
      execution_time: '00:12:03.588550',
      asteroids: 192,
      bsp_downloaded: 2,
    },
    {
      id: 15,
      detail: `/data-preparation/des/orbit-tracer/2`,
      status: 3,
      owner: 'mfreitas',
      start: '2021-04-26T17:05:52.277584Z',
      execution_time: '00:12:04.588550',
      asteroids: 13,
      bsp_downloaded: 8,
    },
    {
      id: 16,
      detail: `/data-preparation/des/orbit-tracer/2`,
      status: 4,
      owner: 'mfreitas',
      start: '2021-02-26T17:05:52.277584Z',
      execution_time: '00:07:04.588550',
      asteroids: 44,
      bsp_downloaded: 15,
    },
    {
      id: 18,
      detail: `/data-preparation/des/orbit-tracer/2`,
      status: 2,
      owner: 'mfreitas',
      start: '2021-01-26T17:05:52.277584Z',
      execution_time: '00:02:04.588550',
      asteroids: 23,
      bsp_downloaded: 1,
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
                <CardHeader title="Orbit Tracer" />
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
                            <InputLabel
                            // classes={{ shrink: classes.shrinkLabel }}
                            >
                              Dynamic Class
                            </InputLabel>
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
                <TextField label="Match Radius (arcsec)" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Magnitude Upper Limit" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Julio&rsquo;s Option 1" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Julio&rsquo;s Option 2" fullWidth />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Dialog>
    </>
  );
}

export default OrbitTracer;
