import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import Checkbox from '@material-ui/core/Checkbox';
import Input from '@material-ui/core/Input';
import { SizeMe } from 'react-sizeme';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import CustomSnackbar from './utils/CustomSnackbar';
import CustomDialog from './utils/CustomDialog';
import CustomTable from './utils/CustomTable';
import {
  getCustomList, getSkybotOutput, getSkybotOutputCount, postCustomList, checkTableName,
} from '../api/Filter';


const useStyles = makeStyles((theme) => ({
  iconList: {
    fontSize: 24,
    cursor: 'pointer',
  },
  button: {
    marginTop: theme.spacing(2),
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  btn: {
    textTransform: 'none',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  btnSuccess: {
    backgroundColor: 'green',
    color: '#fff',
  },
  btnFailure: {
    backgroundColor: 'red',
    color: '#fff',
  },
  btnRunning: {
    backgroundColor: '#ffba01',
    color: '#000',
  },
  btnNotExecuted: {
    backgroundColor: '#ABA6A2',
    color: '#fff',
  },
  btnWarning: {
    backgroundColor: '#D79F15',
    color: '#FFF',
  },
  input: {
    margin: 0,
  },
  iconDetail: {
    fontSize: 18,
  },
  tableWrapper: {
    maxWidth: '100%',
  },
  buttonIcon: {
    margin: '0 2px',
  },
  iconButtonSearch: {
    borderRadius: 2,
    backgroundColor: theme.palette.background.default,
  },
  formControl: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  formControlCheckbox: {
    marginLeft: 6,
  },
  fullHeight: {
    position: 'relative',
    height: '100%',
  },
  formDividerWrapper: {
    padding: '0 !important',
    marginTop: 14,
    marginBottom: 10,

  },
  filterFormButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    width: 'calc(100% - 16px)',
    margin: 'auto',
  },
  filterFormWrapper: {
    paddingBottom: 100,
  },
  filterFrame: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    fontSize: 13,
    fontWeight: 'bold',
    position: 'absolute',
    right: 7,
    borderRadius: 2,
    padding: '1px 2px',
    minWidth: 35,
  },
  filterCountWrapper: {
    position: 'relative',
  },
  filterCountText: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: 0,
    left: 0,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 32,
  },
}));


function FilterObjects({ setTitle, drawerOpen, history }) {
  const classes = useStyles();

  const [searchFilter, setSearchFilter] = useState('');
  const [dynamicClass, setDynamicClass] = useState([0]);
  const [sublevelDynamicClassList, setSublevelDynamicClassList] = useState([]);
  const [sublevelDynamicClassSelected, setSublevelDynamicClassSelected] = useState([]);
  const [visualMagnitudeCheck, setVisualMagnitudeCheck] = useState(false);
  const [visualMagnitude, setVisualMagnitude] = useState(24);
  const [timeMinimumCheck, setTimeMinimumCheck] = useState(false);
  const [timeMinimum, setTimeMinimum] = useState(0);
  const [sameObjectsCheck, setSameObjectsCheck] = useState(false);
  const [filterFormSize, setFilterFormSize] = useState({
    height: 0,
  });
  const [resultTableSize, setResultTableSize] = useState({
    height: 0,
  });
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
  const [tableNameSnackbarVisible, setTableNameSnackbarVisible] = useState(false);
  const [skybotOutputCount, setSkybotOutputCount] = useState(0);


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
      id: 1, parentId: 3, label: 'Detached', value: 'KBO>Detached',
    },
    {
      id: 2, parentId: 3, label: 'Classical', value: 'KBO>Classical',
    },
    {
      id: 3, parentId: 3, label: 'Classical>Inner', value: 'KBO>Classical>Inner',
    },
    {
      id: 4, parentId: 3, label: 'Classical>Main', value: 'KBO>Classical>Main',
    },
    {
      id: 5, parentId: 3, label: 'Classical>Outer', value: 'KBO>Classical>Outer',
    },
    {
      id: 6, parentId: 3, label: 'Resonant>11:3', value: 'KBO>Resonant>11:3',
    },
    {
      id: 7, parentId: 3, label: 'Resonant>11:6', value: 'KBO>Resonant>11:6',
    },
    {
      id: 8, parentId: 3, label: 'Resonant>11:8', value: 'KBO>Resonant>11:8',
    },
    {
      id: 9, parentId: 3, label: 'Resonant>19:9', value: 'KBO>Resonant>19:9',
    },
    {
      id: 10, parentId: 3, label: 'Resonant>2:1', value: 'KBO>Resonant>2:1',
    },
    {
      id: 11, parentId: 3, label: 'Resonant>3:1', value: 'KBO>Resonant>3:1',
    },
    {
      id: 12, parentId: 3, label: 'Resonant>3:2', value: 'KBO>Resonant>3:2',
    },
    {
      id: 13, parentId: 3, label: 'Resonant>4:3', value: 'KBO>Resonant>4:3',
    },
    {
      id: 14, parentId: 3, label: 'Resonant>5:2', value: 'KBO>Resonant>5:2',
    },
    {
      id: 15, parentId: 3, label: 'Resonant>5:3', value: 'KBO>Resonant>5:3',
    },
    {
      id: 16, parentId: 3, label: 'Resonant>5:4', value: 'KBO>Resonant>5:4',
    },
    {
      id: 17, parentId: 3, label: 'Resonant>7:2', value: 'KBO>Resonant>7:2',
    },
    {
      id: 18, parentId: 3, label: 'Resonant>7:3', value: 'KBO>Resonant>7:3',
    },
    {
      id: 19, parentId: 3, label: 'Resonant>7:4', value: 'KBO>Resonant>7:4',
    },
    {
      id: 20, parentId: 3, label: 'Resonant>9:4', value: 'KBO>Resonant>9:4',
    },
    {
      id: 21, parentId: 3, label: 'Resonant>9:5', value: 'KBO>Resonant>9:5',
    },
    {
      id: 22, parentId: 3, label: 'SDO', value: 'KBO>SDO',
    },
    {
      id: 23, parentId: 5, label: 'Cybele', value: 'MB>Cybele',
    },
    {
      id: 24, parentId: 5, label: 'Hilda', value: 'MB>Hilda',
    },
    {
      id: 25, parentId: 5, label: 'Inner', value: 'MB>Inner',
    },
    {
      id: 26, parentId: 5, label: 'Middle', value: 'MB>Middle',
    },
    {
      id: 27, parentId: 5, label: 'Outer', value: 'MB>Outer',
    },
    {
      id: 28, parentId: 6, label: 'Amor', value: 'NEA>Amor',
    },
    {
      id: 29, parentId: 6, label: 'Apollo', value: 'NEA>Apollo',
    },
    {
      id: 30, parentId: 6, label: 'Aten', value: 'NEA>Aten',
    },
    {
      id: 31, parentId: 6, label: 'Aten', value: 'NEA>Atira',
    },
    {
      id: 32, parentId: 4, label: 'Deep', value: 'Mars-Crosser>Deep',
    },
    {
      id: 33, parentId: 4, label: 'Shallow', value: 'Mars-Crosser>Shallow',
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
      icon: <Icon className={clsx(`fas fa-info-circle ${classes.iconDetail}`)} />,
      action: (el) => history.push(`/filter-objects/${el.id}`),
      align: 'center',
    },
    {
      name: 'status',
      title: 'Status',
      align: 'center',
      width: 140,
      customElement: (row) => {
        if (row.status === 'failure' || row.status === 'error') {
          return (
            <span
              className={clsx(classes.btn, classes.btnFailure)}
              title={row.error_msg}
            >
              Failure
            </span>
          );
        } if (row.status === 'running') {
          return (
            <span
              className={clsx(classes.btn, classes.btnRunning)}
              title={row.status}
            >
              Running
            </span>
          );
        } if (row.status === 'not_executed') {
          return (
            <span
              className={clsx(classes.btn, classes.btnNotExecuted)}
              title={row.error_msg}
            >
              Not Executed
            </span>
          );
        } if (row.status === 'warning') {
          return (
            <span
              className={clsx(classes.btn, classes.btnWarning)}
              title={row.error_msg ? row.error_msg : 'Warning'}
            >
              Warning
            </span>
          );
        }

        return (
          <span
            className={clsx(classes.btn, classes.btnSuccess)}
            title={row.status}
          >
            Success
          </span>
        );
      },
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
        <span title={moment(row.creation_date).format('HH:mm:ss')}>
          {moment(row.creation_date).format('MM-DD-YYYY')}
        </span>
      ),
    },
  ];

  useEffect(() => {
    setTitle('Filter Objects');
  }, []);

  useEffect(() => {
    let currentSublevelList = [];
    dynamicClass.forEach((i) => {
      const current = optionsClassFirstLevel[i];
      const currentChildren = optionsClassSecondLevel
        .filter((option) => option.parentId === current.id);
      currentSublevelList = currentSublevelList.concat(currentChildren);
    });
    setSublevelDynamicClassSelected(Object.keys(currentSublevelList).map((el) => Number(el)));
    setSublevelDynamicClassList(currentSublevelList);
  }, [dynamicClass]);

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
    }).then((res) => setSkybotOutputCount(res.count));
  };

  useEffect(() => {
    if (dynamicClass.length > 0) {
      const dynamicClassSelected = dynamicClass
        .map((i) => optionsClassFirstLevel[i].value)
        .concat(
          sublevelDynamicClassSelected
            .map((i) => optionsClassSecondLevel[i].value),
        )
        .join(';');

      loadSkybotOutputCount({
        objectTable: dynamicClassSelected,
        useMagnitude: visualMagnitudeCheck,
        magnitude: visualMagnitude,
        useDifferenceTime: timeMinimumCheck,
        diffDateNights: timeMinimum,
        moreFilter: sameObjectsCheck,
        checked: true,
        name: null,
      });
    }
  }, [dynamicClass, sublevelDynamicClassSelected, visualMagnitudeCheck, visualMagnitude, timeMinimumCheck, timeMinimum, sameObjectsCheck]);

  const handleSearchFilter = (e) => setSearchFilter(e.target.value);

  const loadSkybotOutput = ({
    objectTable = null,
    useMagnitude = null,
    magnitude = null,
    useDifferenceTime = null,
    diffDateNights = null,
    moreFilter = null,
    checked = null,
    currentPage,
  }) => {
    getSkybotOutput({
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
        objectTable: null,
        useMagnitude: null,
        magnitude: null,
        useDifferenceTime: null,
        diffDateNights: null,
        moreFilter: null,
        checked: null,
        currentPage: 0,
      });
    }
  };

  const handleDynamicClass = (e) => {
    setSublevelDynamicClassSelected([]);
    setDynamicClass(e.target.value);
  };

  const handleSublevelDynamicClass = (e) => {
    console.log(e.target.value);
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
          sublevelDynamicClassSelected
            .map((i) => optionsClassSecondLevel[i].value),
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
    sorting, pageSize, currentPage, filter, searchValue,
  }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
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

    const tablename = e.target.value
      .replace(/\s/gi, '_')
      .trim()
      .toLowerCase();

    if (e.target.value.length > 3) {
      if (tablename.length < 3 || tablename.length >= 40) {
        setTableNameValidation({
          name: '',
          valid: false,
          status: 'warning',
          msg: 'Warning! Must be a minimum of 3 and a maximum of 40 characters.',
        });
        setTableNameSnackbarVisible(true);

        setTimeout(() => { setTableNameSnackbarVisible(false); }, 6000);
      } else {
        // Verify if the table already exists:
        checkTableName({ tablename, status: 'success' })
          .then((res) => {
            console.log(res);
            if (res.count === 0) {
              // The table name is unique:
              setTableNameValidation({
                name: tablename,
                valid: true,
                status: 'success',
                msg: 'Success! This table name is unique!',
              });
              setTableNameSnackbarVisible(true);

              setTimeout(() => { setTableNameSnackbarVisible(false); }, 5000);
            } else {
              // Table name is not unique:
              setTableNameValidation({
                name: '',
                valid: false,
                status: 'error',
                msg: 'Error! There\'s already a table with this name.',
              });
              setTableNameSnackbarVisible(true);

              setTimeout(() => { setTableNameSnackbarVisible(false); }, 10000);
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
        sublevelDynamicClassSelected
          .map((i) => optionsClassSecondLevel[i].value),
      )
      .join(';');

    postCustomList({
      displayname: saveName,
      tablename: tableNameValidation.name,
      filters: dynamicClassSelected,
      description: saveDescription,
      filter_dynclass: dynamicClassSelected,
      filter_morefilter: sameObjectsCheck,
      filter_name: searchFilter,
    })
      .then((res) => {
        redirectToObjectList(res.id);
        setResultLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setResultLoading(false);
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
        <Grid
          container
          direction="row"
          spacing={2}
        >
          <Grid item xs={12} md={4}>
            <SizeMe monitorHeight monitorWidth={false}>
              {({ size }) => {
                setFilterFormSize(size);
                return (
                  <Card
                    style={{
                      minHeight: resultTableSize.height > filterFormSize.height
                        ? resultTableSize.height
                        : filterFormSize.height,
                      height: '100%',
                    }}
                  >
                    <CardHeader
                      title="Filter"
                    />
                    <CardContent>
                      <Grid container spacing={4}>
                        <Grid item xs={12}>
                          <form autoComplete="off">
                            <FormControl fullWidth className={classes.formControl}>
                              <Grid container alignItems="flex-end" spacing={1}>
                                <Grid item xs={12} md={9}>
                                  <TextField
                                    label="Search by name"
                                    value={searchFilter}
                                    onChange={handleSearchFilter}
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    fullWidth
                                    onClick={handleSearchFilterSubmit}
                                    disabled={resultLoading}
                                  >
                                    <Icon className={clsx('fas', 'fa-search', classes.buttonIcon)} />
                                    {resultLoading ? (
                                      <CircularProgress
                                        color="primary"
                                        className={classes.buttonProgress}
                                        size={24}
                                      />
                                    ) : null}
                                  </Button>
                                </Grid>
                              </Grid>
                            </FormControl>
                          </form>
                        </Grid>
                        <Grid item xs={12} className={classes.formDividerWrapper}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <form autoComplete="off" className={classes.filterFormWrapper}>
                            <FormControl className={classes.formControl} fullWidth>
                              <InputLabel>Dynamic class</InputLabel>
                              <Select
                                fullWidth
                                multiple
                                value={dynamicClass}
                                onChange={handleDynamicClass}
                                input={<Input />}
                                renderValue={() => (
                                  <div className={classes.chips}>
                                    {dynamicClass.map((i) => (
                                      <Chip
                                        key={optionsClassFirstLevel[i].id}
                                        label={optionsClassFirstLevel[i].label}
                                        className={classes.chip}
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
                            <FormControl className={classes.formControl} fullWidth>
                              <InputLabel>Sublevel dynamic class</InputLabel>
                              <Select
                                disabled={!(sublevelDynamicClassList.length > 0)}
                                fullWidth
                                multiple
                                value={sublevelDynamicClassSelected}
                                onChange={handleSublevelDynamicClass}
                                input={<Input />}
                                renderValue={() => (
                                  <div className={classes.chips}>
                                    {sublevelDynamicClassSelected.map((i) => (
                                      <Chip
                                        key={sublevelDynamicClassList[i].id}
                                        label={sublevelDynamicClassList[i].label}
                                        className={classes.chip}
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
                            <FormControl
                              className={clsx(classes.formControl, classes.formControlCheckbox)}
                              fullWidth
                            >
                              <FormControlLabel
                                control={(
                                  <Checkbox
                                    color="default"
                                    value="Visual magnitude brighter than or equal to"
                                    checked={visualMagnitudeCheck}
                                    onChange={handleMagnitudeCheck}
                                  />
                                )}
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
                            <FormControl
                              className={clsx(classes.formControl, classes.formControlCheckbox)}
                              fullWidth
                            >
                              <FormControlLabel
                                control={(
                                  <Checkbox
                                    color="default"
                                    value="Minimum time difference between observations"
                                    checked={timeMinimumCheck}
                                    onChange={handleTimeMinimumCheck}
                                  />
                                )}
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
                            <FormControl
                              className={clsx(classes.formControl, classes.formControlCheckbox)}
                              fullWidth
                            >
                              <FormControlLabel
                                control={(
                                  <Checkbox
                                    color="default"
                                    value="Show same objects with more than one filter in the same night?"
                                    checked={sameObjectsCheck}
                                    onChange={handleSameObjectsCheck}
                                  />
                                )}
                                label="Show same objects with more than one filter in the same night?"
                              />
                            </FormControl>
                            <Grid container spacing={2} className={classes.filterFormButtons}>
                              <Grid item xs={12} md={6}>
                                <FormControl className={classes.formControl} fullWidth>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    fullWidth
                                    onClick={handleFilterSubmit}
                                    disabled={resultLoading}
                                  >
                                    Filter
                                    <div className={classes.filterFrame}>{skybotOutputCount}</div>
                                    {resultLoading ? (
                                      <CircularProgress
                                        color="primary"
                                        className={classes.buttonProgress}
                                        size={24}
                                      />
                                    ) : null}
                                  </Button>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <FormControl
                                  fullWidth
                                  className={classes.formControl}
                                >
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    className={classes.button}
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
                );
              }}
            </SizeMe>

          </Grid>
          <Grid item xs={12} md={8}>
            <SizeMe monitorHeight monitorWidth={false}>
              {({ size }) => {
                setResultTableSize(size);
                return (
                  <Card
                    style={{
                      minHeight: resultTableSize.height > filterFormSize.height
                        ? resultTableSize.height
                        : filterFormSize.height,
                      height: '100%',
                    }}
                  >
                    <CardHeader
                      title="Result"
                    />
                    <CardContent className={classes.fullHeight}>
                      {resultTableData.length > 0 ? (
                        <form autoComplete="off" className={classes.fullHeight}>
                          <FormControl fullWidth className={classes.formControl}>
                            <CustomTable
                              columns={resultTableColumns}
                              data={resultTableData}
                              totalCount={resultTableData.length}
                              defaultSorting={[{ columnName: 'name', direction: 'desc' }]}
                              hasSearching={false}
                              remote={false}
                            />
                          </FormControl>
                        </form>
                      ) : (
                          <div className={classes.filterCountWrapper}>
                            <Skeleton height={(filterFormSize.height - 95) || 0} />
                            {skybotOutputCount > 0 ? (
                              <span className={classes.filterCountText}>
                                {skybotOutputCount > 1 ? `Current filter has ${skybotOutputCount} objects` : `Current filter has ${skybotOutputCount} object`}
                              </span>
                            ) : null}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                );
              }}
            </SizeMe>
          </Grid>
        </Grid>

      </Grid>
      <Grid item xs={12}>
        <Grid
          container
          direction="row"
          spacing={2}
        >

          <Grid item xs={12} className={clsx(classes.block, classes.tableWrapper)}>
            <Card>
              <CardHeader
                title={<span>History</span>}
              />
              <CardContent>
                <CustomTable
                  columns={historyTableColumns}
                  data={historyTableData}
                  loadData={loadHistoryTableData}
                  totalCount={historyCount}
                  defaultSorting={[{ columnName: 'creation_date', direction: 'desc' }]}
                  loading={true}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <CustomDialog
        maxWidth="md"
        visible={saveDialogVisible}
        setVisible={handleSaveDialogClose}
        title="Save List"
        content={() => (
          <form autoComplete="off" disabled>
            <FormControl className={classes.formControl} fullWidth>
              <TextField
                label="Name"
                variant="outlined"
                margin="normal"
                value={saveName}
                onChange={handleSaveNameChange}
              />
            </FormControl>

            {/* <FormControl fullWidth>
              <TextField
                disabled
                label="Table Name"
                value={tableNameValidation.name}
                margin="none"
                variant="outlined"
              />
            </FormControl> */}

            <FormControl className={classes.formControl} fullWidth>
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
            <FormControl className={classes.formControl} fullWidth>
              <Button color="primary" variant="contained" onClick={handleSaveListClick} disabled={!tableNameValidation.valid}>Save</Button>
              {resultLoading ? (
                <CircularProgress
                  color="primary"
                  className={classes.buttonProgress}
                  size={24}
                />
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
        <CustomSnackbar
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};

export default withRouter(FilterObjects);
