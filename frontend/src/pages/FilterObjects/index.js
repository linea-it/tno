import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  Icon,
  Divider,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Checkbox,
  Input,
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import {
  getCustomList,
  getSkybotOutput,
  getSkybotOutputCount,
  postCustomList,
  checkTableName,
} from '../../services/api/Filter';
import Snackbar from '../../components/Snackbar';
import Dialog from '../../components/Dialog';
import Table from '../../components/Table';
import ColumnStatus from '../../components/Table/ColumnStatus';
import '@fortawesome/fontawesome-free/css/all.min.css';

function FilterObjects({ setTitle, drawerOpen }) {
  const history = useHistory();
  const [searchFilter, setSearchFilter] = useState('');
  const [dynamicClass, setDynamicClass] = useState([]);
  const [sublevelDynamicClassList, setSublevelDynamicClassList] = useState([]);
  const [
    sublevelDynamicClassSelected,
    setSublevelDynamicClassSelected,
  ] = useState([]);
  const [visualMagnitudeCheck, setVisualMagnitudeCheck] = useState(false);
  const [visualMagnitude, setVisualMagnitude] = useState(24);
  const [timeMinimumCheck, setTimeMinimumCheck] = useState(false);
  const [timeMinimum, setTimeMinimum] = useState(0);
  const [sameObjectsCheck, setSameObjectsCheck] = useState(false);
  const [historyTableData, setHistoryTableData] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [resultTableData, setResultTableData] = useState([]);
  const [resultLoading, setResultLoading] = useState(false);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [tableNameValidation, setTableNameValidation] = useState({
    name: '',
    valid: false,
    status: '',
    msg: '',
  });
  const [tableNameSnackbarVisible, setTableNameSnackbarVisible] = useState(
    false
  );
  const [objectsCount, setObjectsCount] = useState(0);
  const [observationsCount, setObservationsCount] = useState(0);

  const optionsClassFirstLevel = [
    { id: 1, label: 'Centaur', value: 'Centaur' },
    { id: 2, label: 'Hungaria', value: 'Hungaria' },
    { id: 3, label: 'KBO', value: 'KBO' },
    { id: 4, label: 'Mars-Crosser', value: 'Mars-Crosser' },
    { id: 5, label: 'MB', value: 'MB' },
    { id: 6, label: 'NEA', value: 'NEA' },
    { id: 7, label: 'Trojan', value: 'Trojan' },
  ];

  const optionsClassSecondLevel = [
    {
      id: 1,
      parentId: 3,
      label: 'Detached',
      value: 'KBO>Detached',
    },
    {
      id: 2,
      parentId: 3,
      label: 'Classical',
      value: 'KBO>Classical',
    },
    {
      id: 3,
      parentId: 3,
      label: 'Classical>Inner',
      value: 'KBO>Classical>Inner',
    },
    {
      id: 4,
      parentId: 3,
      label: 'Classical>Main',
      value: 'KBO>Classical>Main',
    },
    {
      id: 5,
      parentId: 3,
      label: 'Classical>Outer',
      value: 'KBO>Classical>Outer',
    },
    {
      id: 6,
      parentId: 3,
      label: 'Resonant>11:3',
      value: 'KBO>Resonant>11:3',
    },
    {
      id: 7,
      parentId: 3,
      label: 'Resonant>11:6',
      value: 'KBO>Resonant>11:6',
    },
    {
      id: 8,
      parentId: 3,
      label: 'Resonant>11:8',
      value: 'KBO>Resonant>11:8',
    },
    {
      id: 9,
      parentId: 3,
      label: 'Resonant>19:9',
      value: 'KBO>Resonant>19:9',
    },
    {
      id: 10,
      parentId: 3,
      label: 'Resonant>2:1',
      value: 'KBO>Resonant>2:1',
    },
    {
      id: 11,
      parentId: 3,
      label: 'Resonant>3:1',
      value: 'KBO>Resonant>3:1',
    },
    {
      id: 12,
      parentId: 3,
      label: 'Resonant>3:2',
      value: 'KBO>Resonant>3:2',
    },
    {
      id: 13,
      parentId: 3,
      label: 'Resonant>4:3',
      value: 'KBO>Resonant>4:3',
    },
    {
      id: 14,
      parentId: 3,
      label: 'Resonant>5:2',
      value: 'KBO>Resonant>5:2',
    },
    {
      id: 15,
      parentId: 3,
      label: 'Resonant>5:3',
      value: 'KBO>Resonant>5:3',
    },
    {
      id: 16,
      parentId: 3,
      label: 'Resonant>5:4',
      value: 'KBO>Resonant>5:4',
    },
    {
      id: 17,
      parentId: 3,
      label: 'Resonant>7:2',
      value: 'KBO>Resonant>7:2',
    },
    {
      id: 18,
      parentId: 3,
      label: 'Resonant>7:3',
      value: 'KBO>Resonant>7:3',
    },
    {
      id: 19,
      parentId: 3,
      label: 'Resonant>7:4',
      value: 'KBO>Resonant>7:4',
    },
    {
      id: 20,
      parentId: 3,
      label: 'Resonant>9:4',
      value: 'KBO>Resonant>9:4',
    },
    {
      id: 21,
      parentId: 3,
      label: 'Resonant>9:5',
      value: 'KBO>Resonant>9:5',
    },
    {
      id: 22,
      parentId: 3,
      label: 'SDO',
      value: 'KBO>SDO',
    },
    {
      id: 23,
      parentId: 5,
      label: 'Cybele',
      value: 'MB>Cybele',
    },
    {
      id: 24,
      parentId: 5,
      label: 'Hilda',
      value: 'MB>Hilda',
    },
    {
      id: 25,
      parentId: 5,
      label: 'Inner',
      value: 'MB>Inner',
    },
    {
      id: 26,
      parentId: 5,
      label: 'Middle',
      value: 'MB>Middle',
    },
    {
      id: 27,
      parentId: 5,
      label: 'Outer',
      value: 'MB>Outer',
    },
    {
      id: 28,
      parentId: 6,
      label: 'Amor',
      value: 'NEA>Amor',
    },
    {
      id: 29,
      parentId: 6,
      label: 'Apollo',
      value: 'NEA>Apollo',
    },
    {
      id: 30,
      parentId: 6,
      label: 'Aten',
      value: 'NEA>Aten',
    },
    {
      id: 31,
      parentId: 6,
      label: 'Aten',
      value: 'NEA>Atira',
    },
    {
      id: 32,
      parentId: 4,
      label: 'Deep',
      value: 'Mars-Crosser>Deep',
    },
    {
      id: 33,
      parentId: 4,
      label: 'Shallow',
      value: 'Mars-Crosser>Shallow',
    },
  ];

  const resultTableColumns = [
    {
      name: 'name',
      title: 'Name',
      sortingEnabled: false,
    },
    {
      name: 'freq',
      title: 'CCD Numbers',
      width: 80,
      sortingEnabled: false,
    },
    {
      name: 'filters',
      title: 'Filters',
      width: 80,
      align: 'center',
      sortingEnabled: false,
    },
    {
      name: 'mag_min',
      title: 'Mag. Min.',
      sortingEnabled: false,
    },
    {
      name: 'mag_max',
      title: 'Mag. Max.',
      sortingEnabled: false,
    },
    {
      name: 'min_errpos',
      title: 'Min. Errpos.',
      sortingEnabled: false,
    },
    {
      name: 'max_errpos',
      title: 'Max. Errpos.',
      sortingEnabled: false,
    },
    {
      name: 'diff_nights',
      title: 'Diff. Nights',
      sortingEnabled: false,
    },
    {
      name: 'diff_date_nights',
      title: 'Diff. Date Max',
      width: 130,
      sortingEnabled: false,
    },
  ];

  const historyTableColumns = [
    {
      name: 'id',
      title: 'Details',
      width: 100,
      icon: <Icon className="fas fa-info-circle" />,
      action: (el) => history.push(`/filter-objects/${el.id}`),
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 140,
      customElement: (row) => (
        <ColumnStatus status={row.status} title={row.error_msg} />
      ),
    },
    {
      name: 'displayname',
      title: 'Name',
    },
    {
      name: 'owner',
      title: 'Owner',
      sortingEnabled: false,
    },
    {
      name: 'rows',
      title: 'Rows',
      sortingEnabled: false,
    },
    {
      name: 'h_size',
      title: 'Size',
      sortingEnabled: false,
    },
    {
      name: 'creation_date',
      title: 'Date',
      customElement: (row) => (
        <span>
          {row.creation_date
            ? moment(row.creation_date).format('YYYY-MM-DD')
            : ''}
        </span>
      ),
    },
  ];

  useEffect(() => {
    setTitle('Filter Objects');
  }, [setTitle]);

  useCallback(() => {
    let currentSublevelList = [];
    dynamicClass.forEach((i) => {
      const current = optionsClassFirstLevel[i];
      const currentChildren = optionsClassSecondLevel.filter(
        (option) => option.parentId === current.id
      );
      currentSublevelList = currentSublevelList.concat(currentChildren);
    });

    const sublevelSelected = Object.keys(currentSublevelList).map((el) =>
      Number(el)
    );

    setSublevelDynamicClassSelected(sublevelSelected);
    setSublevelDynamicClassList(currentSublevelList);
  }, [dynamicClass, optionsClassFirstLevel, optionsClassSecondLevel]);

  const loadSkybotOutputCount = ({
    objectTable = null,
    useMagnitude = null,
    magnitude = null,
    useDifferenceTime = null,
    diffDateNights = null,
    moreFilter = null,
    checked = null,
  }) => {
    getSkybotOutputCount({
      objectTable,
      useMagnitude,
      magnitude,
      useDifferenceTime,
      diffDateNights,
      moreFilter,
      checked,
    }).then((res) => {
      setObjectsCount(res.count_objects);
      setObservationsCount(res.count_observations);
    });
  };

  useEffect(() => {
    if (dynamicClass.length > 0) {
      const dynamicClassSelected = dynamicClass
        .map((i) => optionsClassFirstLevel[i].value)
        .concat(
          sublevelDynamicClassSelected.map(
            (i) => optionsClassSecondLevel[i].value
          )
        )
        .join(';');

      // Todas as vezes que um dos filtros muda
      // Executa a query que retorna o total de resultados.
      loadSkybotOutputCount({
        objectTable: dynamicClassSelected,
        useMagnitude: visualMagnitudeCheck,
        magnitude: visualMagnitude,
        useDifferenceTime: timeMinimumCheck,
        diffDateNights: timeMinimum,
        moreFilter: sameObjectsCheck,
        checked: true,
      });
    }
  }, [
    dynamicClass,
    sublevelDynamicClassSelected,
    visualMagnitudeCheck,
    visualMagnitude,
    timeMinimumCheck,
    timeMinimum,
    sameObjectsCheck,
    optionsClassFirstLevel,
    optionsClassSecondLevel,
  ]);

  const handleSearchFilter = (e) => setSearchFilter(e.target.value);

  const loadSkybotOutput = ({
    name = null,
    objectTable = null,
    useMagnitude = null,
    magnitude = null,
    useDifferenceTime = null,
    diffDateNights = null,
    moreFilter = null,
    checked = null,
    currentPage = 0,
  }) => {
    getSkybotOutput({
      name,
      objectTable,
      useMagnitude,
      magnitude,
      useDifferenceTime,
      diffDateNights,
      moreFilter,
      checked,
      page: currentPage + 1,
    }).then((res) => {
      setResultLoading(false);
      setResultTableData(res.results);
    });
  };

  const handleSearchFilterSubmit = () => {
    if (searchFilter !== '') {
      setResultLoading(true);
      setResultTableData([]);
      loadSkybotOutput({
        name: searchFilter,
      });
    }
  };

  const handleDynamicClass = (e) => {
    setSublevelDynamicClassSelected([]);
    setDynamicClass(e.target.value);
  };

  const handleSublevelDynamicClass = (e) => {
    setSublevelDynamicClassSelected(e.target.value);
  };

  const handleMagnitudeCheck = (e) => setVisualMagnitudeCheck(e.target.checked);

  const handleMagnitude = (e) => setVisualMagnitude(e.target.value);

  const handleTimeMinimumCheck = (e) => setTimeMinimumCheck(e.target.checked);

  const handleSameObjectsCheck = (e) => setSameObjectsCheck(e.target.checked);

  const handleTimeMinimum = (e) => setTimeMinimum(e.target.value);

  const handleFilterSubmit = () => {
    if (dynamicClass.length > 0) {
      setResultLoading(true);
      setResultTableData([]);
      const dynamicClassSelected = dynamicClass
        .map((i) => optionsClassFirstLevel[i].value)
        .concat(
          sublevelDynamicClassSelected.map(
            (i) => optionsClassSecondLevel[i].value
          )
        )
        .join(';');

      loadSkybotOutput({
        objectTable: dynamicClassSelected,
        useMagnitude: visualMagnitudeCheck,
        magnitude: visualMagnitude,
        useDifferenceTime: timeMinimumCheck,
        diffDateNights: timeMinimum,
        moreFilter: sameObjectsCheck,
        checked: true,
        currentPage: 0,
        name: null,
      });
    }
  };

  const handleSaveSubmit = () => setSaveDialogVisible(true);

  const loadHistoryTableData = ({
    sorting,
    pageSize,
    currentPage,
    filter,
    searchValue,
  }) => {
    const ordering =
      sorting[0].direction === 'desc'
        ? `-${sorting[0].columnName}`
        : sorting[0].columnName;
    getCustomList({
      ordering,
      pageSize,
      page: currentPage !== 0 ? currentPage + 1 : 1,
      filter,
      search: searchValue,
    }).then((res) => {
      setHistoryTableData(res.results);
      setHistoryCount(res.count);
    });
  };

  const handleSaveDialogClose = () => setSaveDialogVisible(false);

  const handleSaveNameChange = (e) => {
    setSaveName(e.target.value);

    const tablename = e.target.value.replace(/\s/gi, '_').trim().toLowerCase();

    if (e.target.value.length > 3) {
      if (tablename.length < 3 || tablename.length >= 40) {
        setTableNameValidation({
          name: '',
          valid: false,
          status: 'warning',
          msg:
            'Warning! Must be a minimum of 3 and a maximum of 40 characters.',
        });
        setTableNameSnackbarVisible(true);

        setTimeout(() => {
          setTableNameSnackbarVisible(false);
        }, 6000);
      } else {
        // Verify if the table already exists:
        checkTableName({ tablename, status: 'success' }).then((res) => {
          if (res.count === 0) {
            // The table name is unique:
            setTableNameValidation({
              name: tablename,
              valid: true,
              status: 'success',
              msg: 'Success! This table name is unique!',
            });
            setTableNameSnackbarVisible(true);

            setTimeout(() => {
              setTableNameSnackbarVisible(false);
            }, 5000);
          } else {
            // Table name is not unique:
            setTableNameValidation({
              name: '',
              valid: false,
              status: 'error',
              msg: "Error! There's already a table with this name.",
            });
            setTableNameSnackbarVisible(true);

            setTimeout(() => {
              setTableNameSnackbarVisible(false);
            }, 10000);
          }
        });
      }
    }
  };

  const handleSaveDescriptionChange = (e) => setSaveDescription(e.target.value);

  const redirectToObjectList = (id) => history.push(`/filter-objects/${id}`);

  const handleSaveListClick = () => {
    setResultLoading(true);
    const dynamicClassSelected = dynamicClass
      .map((i) => optionsClassFirstLevel[i].value)
      .concat(
        sublevelDynamicClassSelected.map(
          (i) => optionsClassSecondLevel[i].value
        )
      )
      .join(';');

    postCustomList({
      displayname: saveName,
      tablename: tableNameValidation.name,
      description: saveDescription,
      filter_dynclass: dynamicClassSelected,
      filter_magnitude: visualMagnitude,
      filter_diffdatenights: timeMinimum,
      filter_morefilter: sameObjectsCheck,
      filter_name: searchFilter,
    })
      .then((res) => {
        redirectToObjectList(res.id);
        setResultLoading(false);
      })
      .catch((err) => {
        setResultLoading(false);
        return err;
      });
  };

  const handleTableNameSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setTableNameSnackbarVisible(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Filter" />
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <form autoComplete="off">
                      <FormControl fullWidth>
                        <Grid container alignItems="flex-end" spacing={1}>
                          <Grid item xs={12} md={9}>
                            <TextField
                              label="Search by object name"
                              value={searchFilter}
                              onChange={handleSearchFilter}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              onClick={handleSearchFilterSubmit}
                              disabled={resultLoading}
                            >
                              <Icon className="fas fa-search" />
                              {resultLoading ? (
                                <CircularProgress color="primary" size={24} />
                              ) : null}
                            </Button>
                          </Grid>
                        </Grid>
                      </FormControl>
                    </form>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <form autoComplete="off">
                      <FormControl fullWidth>
                        <InputLabel>Dynamic class</InputLabel>
                        <Select
                          fullWidth
                          multiple
                          value={dynamicClass}
                          onChange={handleDynamicClass}
                          input={<Input />}
                          renderValue={() => (
                            <div>
                              {dynamicClass.map((i) => (
                                <Chip
                                  key={optionsClassFirstLevel[i].id}
                                  label={optionsClassFirstLevel[i].label}
                                />
                              ))}
                            </div>
                          )}
                        >
                          {optionsClassFirstLevel.map((option, i) => (
                            <MenuItem key={option.id} value={i}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Sublevel dynamic class</InputLabel>
                        <Select
                          disabled={!(sublevelDynamicClassList.length > 0)}
                          fullWidth
                          multiple
                          value={sublevelDynamicClassSelected}
                          onChange={handleSublevelDynamicClass}
                          input={<Input />}
                          renderValue={() => (
                            <div>
                              {sublevelDynamicClassSelected.map((i) => (
                                <Chip
                                  key={sublevelDynamicClassList[i].id}
                                  label={sublevelDynamicClassList[i].label}
                                />
                              ))}
                            </div>
                          )}
                        >
                          {sublevelDynamicClassList.map((option, i) => (
                            <MenuItem key={option.id} value={i}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="default"
                              value="Visual magnitude brighter than or equal to"
                              checked={visualMagnitudeCheck}
                              onChange={handleMagnitudeCheck}
                            />
                          }
                          label="Visual Magnitude brighter than or equal to"
                        />
                        <TextField
                          disabled={!visualMagnitudeCheck}
                          value={visualMagnitude}
                          onChange={handleMagnitude}
                          type="number"
                          inputProps={{ min: 0, max: 55 }}
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="default"
                              value="Minimum time difference between observations"
                              checked={timeMinimumCheck}
                              onChange={handleTimeMinimumCheck}
                            />
                          }
                          label="Minimum time difference between observations"
                        />
                        <TextField
                          disabled={!timeMinimumCheck}
                          value={timeMinimum}
                          onChange={handleTimeMinimum}
                          type="number"
                          inputProps={{ min: 0, max: 1000 }}
                        />
                      </FormControl>
                      <FormControl fullWidth>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="default"
                              value="Show same objects with more than one filter in the same night?"
                              checked={sameObjectsCheck}
                              onChange={handleSameObjectsCheck}
                            />
                          }
                          label="Show same objects with more than one filter in the same night?"
                        />
                      </FormControl>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              onClick={handleFilterSubmit}
                              disabled={resultLoading}
                            >
                              Filter
                              {/* <div className={classes.filterFrame}>{objectsCount}</div> */}
                              {resultLoading ? (
                                <CircularProgress color="primary" size={24} />
                              ) : null}
                            </Button>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSaveSubmit}
                              disabled={!(resultTableData.length > 0)}
                            >
                              Save
                            </Button>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </form>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Result" />
              <CardContent>
                {resultTableData.length > 0 ? (
                  <form autoComplete="off">
                    <FormControl fullWidth>
                      <Table
                        columns={resultTableColumns}
                        data={resultTableData}
                        totalCount={resultTableData.length}
                        defaultSorting={[
                          { columnName: 'name', direction: 'desc' },
                        ]}
                        hasSearching={false}
                        remote={false}
                      />
                    </FormControl>
                  </form>
                ) : (
                  <div>
                    <Skeleton height={350} />
                    {objectsCount > 0 ? (
                      <span>
                        {objectsCount > 1
                          ? `Current filter has ${objectsCount} objects`
                          : `Current filter has ${objectsCount} object`}
                        {observationsCount !== null
                          ? ` and ${observationsCount} observations`
                          : ''}
                      </span>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={<span>History</span>} />
              <CardContent>
                <Table
                  columns={historyTableColumns}
                  data={historyTableData}
                  loadData={loadHistoryTableData}
                  totalCount={historyCount}
                  defaultSorting={[
                    { columnName: 'creation_date', direction: 'desc' },
                  ]}
                  loading
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        maxWidth="md"
        visible={saveDialogVisible}
        setVisible={handleSaveDialogClose}
        title="Save List"
        content={() => (
          <form autoComplete="off" disabled>
            <FormControl fullWidth>
              <TextField
                label="Name"
                variant="outlined"
                margin="normal"
                value={saveName}
                onChange={handleSaveNameChange}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Description"
                multiline
                rows="4"
                margin="normal"
                variant="outlined"
                value={saveDescription}
                onChange={handleSaveDescriptionChange}
              />
            </FormControl>
            <Divider />
            <FormControl fullWidth>
              <Button
                color="primary"
                variant="contained"
                onClick={handleSaveListClick}
                disabled={!tableNameValidation.valid}
              >
                Save
              </Button>
              {resultLoading ? (
                <CircularProgress color="primary" size={24} />
              ) : null}
            </FormControl>
          </form>
        )}
        wrapperStyle={{
          maxWidth: drawerOpen ? 'calc(100% - 240px)' : 'calc(100% - 64px)',
          marginLeft: drawerOpen ? '240px' : '64px',
          top: '-64px',
        }}
      />

      {tableNameValidation.status ? (
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={tableNameSnackbarVisible}
          autoHideDuration={5000} // Auto hide is not working, so I improvised with a "setTimeout".
          onClose={handleTableNameSnackbarClose}
          message={tableNameValidation.msg}
          variant={tableNameValidation.status}
        />
      ) : null}
    </Grid>
  );
}

FilterObjects.propTypes = {
  setTitle: PropTypes.func.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default FilterObjects;
