import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  Button,
  FormControl,

} from '@material-ui/core';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getOccultations } from '../../services/api/Occultation';
import Image from '../../components/List/Image';
import useStyles from './styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  getDynClassList,
  getBaseDynClassList,
  getAsteroidsWithPredictionList,
  getFilteredWithPredictionList
} from '../../services/api/Asteroid'
import Select from 'react-select'
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons'
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index'
import Table from '../../components/Table/index'
import './occultation.css'
import { CardHeader, MenuItem, OutlinedInput } from '../../../node_modules/@material-ui/core/index';

function Occultation() {
  const navigate = useNavigate();
  const classes = useStyles()
  const [magnitude, setMagnitude] = useState([4, 23]);
  const [diameter, setDiameter] = useState([0, 600]);
  const [zoneValue, setZoneValue] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [dateStartError, setDateStartError] = useState(false);
  const [dateEndError, setDateEndError] = useState(false);
  const [filterTypeList, setFilterTypeList] = useState([{ value: 'Name', label: 'Name' }, { value: 'DynClass', label: 'DynClass' }, { value: 'Base DynClass', label: 'Base DynClass' }]);
  const [dynClassList, setDynClassList] = useState([]);
  const [baseDynClassList, setBaseDynClassList] = useState([]);
  const [asteroidsList, setAsteroidsList] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const useMountEffect = (fun) => useEffect(fun, []);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [reload, setReload] = useState(true);
  const [defaultHiddenColumnNames, setDefaultHiddenColumnNames] = useState([])

  const tableColumns = [
    {
      name: 'index',
      title: ' ',
      width: 70,
      sortingEnabled: false
    },
    {
      name: 'detail',
      title: 'Detail',
      width: 80,
      customElement: (row) => (
        <Button onClick={() => navigate(row.detail)}>
          <InfoOutlinedIcon />
        </Button>
      ),
      align: 'center',
      sortingEnabled: false
    },
    {
      name: 'date_time',
      title: 'Date',
      width: 150,
      align: 'center',
      enableHiding: false,
      customElement: (row) => row.date_time ? <span title={moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.date_time).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
    },
    {
      name: 'ra_star_candidate',
      title: 'RA Star Candidate ',
      width: 150,
      align: 'center',
    },
    {
      name: 'dec_star_candidate',
      title: 'DEC Star Candidate ',
      width: 150,
      align: 'center',
    },
    {
      name: 'ra_target',
      title: 'RA Target ',
      width: 150,
      align: 'center',
    },
    {
      name: 'dec_target',
      title: 'DEC Target ',
      width: 150,
      align: 'center',
    },
    {
      name: 'closest_approach',
      title: 'Closest Approach ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.closest_approach?row.closest_approach.toFixed(2):''}</span>
    },
    {
      name: 'position_angle',
      title: 'Position Angle ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.position_angle?row.position_angle.toFixed(2):''}</span>
    },
    {
      name: 'velocity',
      title: 'Velocity ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.velocity?row.velocity.toFixed(2):''}</span>
    },
    {
      name: 'delta',
      title: 'Delta ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.delta?row.delta.toFixed(2):''}</span>
    },
    {
      name: 'g',
      title: 'G ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.g?row.g.toFixed(2):''}</span>
    },
    {
      name: 'j',
      title: 'J ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.j?row.j.toFixed(2):''}</span>
    },
    {
      name: 'h',
      title: 'H ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.h?row.h.toFixed(2):''}</span>
    },
    {
      name: 'k',
      title: 'K ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.k?row.k.toFixed(2):''}</span>
    },
    {
      name: 'long',
      title: 'Long ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.long?row.long.toFixed(2):''}</span>
    },
    {
      name: 'loc_t',
      title: 'Loc T ',
      width: 150,
      align: 'center',
    },
    {
      name: 'off_ra',
      title: 'Off RA ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.off_ra?row.off_ra.toFixed(2):''}</span>
    },
    {
      name: 'off_dec',
      title: 'Off DEC ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.off_dec?row.off_dec.toFixed(2):''}</span>
    },
    {
      name: 'proper_motion',
      title: 'Proper Motion ',
      width: 150,
      align: 'center',
    },
    {
      name: 'ct',
      title: 'CT ',
      width: 150,
      align: 'center',
    },
    {
      name: 'multiplicity_flag',
      title: 'Multiplicity Flag ',
      width: 150,
      align: 'center',
    },
    {
      name: 'e_ra',
      title: 'E RA ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.e_ra?row.e_ra.toFixed(2):''}</span>
    },
    {
      name: 'e_dec',
      title: 'E DEC ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.e_dec?row.e_dec.toFixed(2):''}</span>
    },
    {
      name: 'pmra',
      title: 'PMRA',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.pmra?row.pmra.toFixed(2):''}</span>
    },
    {
      name: 'pmdec',
      title: 'PMDEC',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.pmdec?row.pmdec.toFixed(2):''}</span>
    },
    {
      name: 'ra_star_deg',
      title: 'RA Star (DEG) ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.ra_star_deg?row.ra_star_deg.toFixed(2):''}</span>
    },
    {
      name: 'dec_star_deg',
      title: 'DEC Star (DEG) ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.dec_star_deg?row.dec_star_deg.toFixed(2):''}</span>
    },
    {
      name: 'ra_target_deg',
      title: 'RA Target (DEG) ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.ra_target_deg?row.ra_target_deg.toFixed(2):''}</span>
    },
    {
      name: 'dec_target_deg',
      title: 'Dec Target (DEG) ',
      width: 150,
      align: 'center',
      customElement: (row) => <span>{row.dec_target_deg?row.dec_target_deg.toFixed(2):''}</span>
    },
    {
      name: 'created_at',
      title: 'Created At',
      width: 150,
      align: 'center',
      customElement: (row) => row.created_at ? <span title={moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')}>{moment(row.created_at).format('YYYY-MM-DD HH:mm:ss')}</span> : <span>Invalid Date</span>
    },

  ]

  const filterTypehandleChange = (event) => {
    if (event) {
      setFilterValue("");
      setFilterType(event);
    }
  };

  const filterValuehandleChange = (event) => {
    if (event) {
      setFilterValue(event);
    }
  };

  const filterValueNameshandleChange = (event) => {
    if (event) {
      let stringArray = event.map(x => { return x.value }).toString().replaceAll(',', ';');
      setFilterValue({ value: stringArray, label: stringArray });
    }
  };

  useMountEffect(() => {
    getDynClassList().then((list) => {
      setDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getBaseDynClassList().then((list) => {
      setBaseDynClassList(list.map(x => { return { value: x, label: x } }));
    })

    getAsteroidsWithPredictionList().then((list) => {
      setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
    })

  });

  const handleDiameter = (event, value) => {
    setDiameter(value);
  };

  const handleChangeZone = (event) => {
    setZoneValue(event.target.value);
  };

  const handleChangeMagnitudeValue = (event, value) => {
    setMagnitude(value);
  };

  const handleChangeDiameterValue = (event, value) => {
    setDiameter(value);
  };

  const zoneArray = [
    { value: 'East-Asia', label: 'East-Asia' },
    { value: 'Europe & North Africa', label: 'Europe & North Africa' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Southern Africa', label: 'Southern Africa', },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
  ];

  const calculateDate = (filter) => {
    const currentDate = dateStart ? dateStart : moment();
    setDateStart(currentDate);
    var dateEnd = moment();

    switch (filter) {
      case '1week':
        dateEnd = moment(currentDate).add(7, 'days');
        break;
      case '1mounth':
        dateEnd = moment(currentDate).add(30, 'days');
        break;
      case '6mounths':
        dateEnd = moment(currentDate).add(180, 'days');
        break;
      case '1year':
        dateEnd = moment(currentDate).add(365, 'days');
        break;
    }
    setDateEnd(dateEnd);
  }


  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc'? `-${sorting[0].columnName}`: sorting[0].columnName;
    const start = dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value = filterValue.value ? filterValue.value : null;
    const minmag = magnitude[0] > 4? magnitude[0]:null;
    const maxmag = magnitude[1] < 23? magnitude[1]:null;
    getOccultations({
      page: currentPage + 1,
      pageSize,
      ordering: ordering,
      start_date: start,
      end_date: end,
      filter_type: value?type:null,
      filter_value: value,
      min_mag: minmag,
      max_mag: maxmag
    }).then((res) => {
      const { data } = res
      setTableData(
        data.results.map((row) => ({
          key: row.id,
          detail: `/dashboard/data-preparation/occultation-detail/${row.id}`,
          ...row
        }))
      )
      setTotalCount(data.count)
    })
  }

  const handleFilterClick = async () => {
    loadData({ sorting: [{ columnName: 'id', direction: 'asc' }], pageSize: 10, currentPage: 0 });
  }

  useEffect(() => {
    handleFilterClick();
  }, [dateStart, dateEnd, filterValue, magnitude]);

  const onKeyUp = async (event) => {
    if(event.target.value.length > 1){
        getFilteredWithPredictionList(event.target.value).then((list) => {
          setAsteroidsList(list.map(x => { return { value: x.name, label: x.name } }));
        })
    }
  }

  return (
    <Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Selection of occultation events' />
            <CardContent>
              <form noValidate autoComplete="off">
                <Grid container spacing={2} alignItems='stretch'>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth ><label>Date Filter (start)</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                        </LocalizationProvider>
                      </FormControl>                      
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Date Filter (end)</label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                        </LocalizationProvider>
                      </FormControl>                     
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Filter Type</label>
                        <Select
                          value={filterType}
                          id="filterType"
                          onChange={filterTypehandleChange}
                          options={filterTypeList}
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                        />
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl  onKeyUp={onKeyUp} fullWidth><label>Filter Value</label>
                        {filterType.value == null &&
                          <Select
                            id="filter"
                            isDisabled
                            placeholder="Select Filter Value"
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                        {filterType.value == "Name" &&
                          <Select
                            id="filterName"
                            onChange={filterValueNameshandleChange}
                            isMulti
                            options={asteroidsList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                        {filterType.value == "DynClass" &&
                          <Select
                            value={filterValue}
                            id="filterDynClass"
                            onChange={filterValuehandleChange}
                            options={dynClassList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                        {filterType.value == "Base DynClass" &&
                          <Select
                            value={filterValue}
                            id="filterBaseDynClass"
                            onChange={filterValuehandleChange}
                            options={baseDynClassList}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                          />
                        }
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth><label>Zone</label>
                        <Select
                          value={zoneValue}
                          id="filterZone"
                          onChange={handleChangeZone}
                          options={zoneArray}
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          isDisabled={true}
                        />
                      </FormControl>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>                   
                    <FormControl fullWidth><label>Magnitude Filter</label>
                      <Slider
                        value={magnitude}
                        step={1}
                        min={4}
                        max={23}
                        valueLabelDisplay="auto"
                        onChange={handleChangeMagnitudeValue}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>                   
                    <FormControl fullWidth><label>Diameter Filter (Km)</label>
                    <Slider
                        value={diameter}
                        step={1}
                        min={0}
                        max={600}
                        valueLabelDisplay="auto"
                        onChange={handleChangeDiameterValue}
                        disabled
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={`Occultation Result - Total: ${totalCount}` }/>
            <CardContent>
              <Table
                columns={tableColumns}
                data={tableData}
                loadData={loadData}
                hasSearching={false}
                hasPagination
                hasColumnVisibility={true}
                hasToolbar={true}
                reload={reload}
                totalCount={totalCount}
                defaultHiddenColumnNames={defaultHiddenColumnNames}
                defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Occultation
