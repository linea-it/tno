import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent,
  Box,
  FormControl
} from '@material-ui/core';
import styles from './styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { getOccultations, getNextTwenty, filter_by_location } from '../../../../../services/api/Occultation';
import { useNavigate } from '../../../../../../node_modules/react-router-dom/dist/index';
import "./ocultation.css";
import clsx from 'clsx'
import OccultationTable from '../../../../../components/OccultationTable/index';
import OccultationFilter from '../../../../../components/OccultationFilter/index';
import { useIsMount } from '../../../../../hooks/useIsMount';

function PublicOcutation() {
  const navigate = useNavigate();
  const classes = styles();
  const [filterView, setFilterView] = useState('next');
  const [magnitude, setMagnitude] = useState([4, 14]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(500);
  const [geoFilter, setGeoFilter] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [erroLocation, setErroLocation] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const isMount = useIsMount();

  function urlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if (http.status != 404)
      return true;
    else
      return false;
  }

  // function getMapUrl(occultation) {
  //   return process.env.REACT_APP_SORA + '/map?name=' + encodeURI(occultation.name) + '&time=' + encodeURI(new Date(occultation.date_time).toISOString())
  // }

  const loadData = ({ sorting, pageSize, currentPage }) => {
    const ordering = sorting[0].direction === 'desc' ? `-${sorting[0].columnName}` : sorting[0].columnName;
    const start = (filterView === "userSelect" || filterView === "period") && dateStart ? new Date(dateStart).toISOString().slice(0, 10) + ' 00:00:00' : null;
    const end = (filterView === "userSelect" || filterView === "period") && dateEnd ? new Date(dateEnd).toISOString().slice(0, 10) + ' 23:59:59' : null;
    const type = filterView === "userSelect" && filterType.value ? filterType.value.toLowerCase().replaceAll(' ', '_') : null;
    const value = filterView === "userSelect" && filterValue.value ? filterValue.value : null;
    const minmag = filterView === "userSelect" ? magnitude[0] : null;
    const maxmag = filterView === "userSelect" ? magnitude[1] : null;
    if (filterView === "next") {
      getNextTwenty({
        page: currentPage + 1,
        pageSize,
        ordering: ordering,
      }).then((res) => {
        setTableData(
          res.results.map((row) => ({
            key: row.id,
            detail: `/occultation-detail/${row.id}`,
            // map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
            ...row
          }))
        )
        setTotalCount(res.count)
      })
    }
    else {
      if (latitude && longitude && radius && geoFilter) {
        setLoadingLocation(true);
        setTableData([]);
        setTotalCount(0);
        filter_by_location({
          page: currentPage + 1,
          pageSize,
          ordering: ordering,
          start_date: start,
          end_date: end,
          filter_type: value ? type : null,
          filter_value: value,
          min_mag: minmag,
          max_mag: maxmag,
          lat: latitude,
          long: longitude,
          radius: radius
        }).then((res) => {
          const { data } = res
          setLoadingLocation(false);
          setTableData(
            data.results.map((row) => ({
              key: row.id,
              detail: `/occultation-detail/${row.id}`,
              // map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
              ...row
            }))
          )
          setTotalCount(data.count)
        },
          (reason) => {
            setLoadingLocation(false);
            setErroLocation(true);
            console.error(reason);
          });
      }
      else {
        getOccultations({
          page: currentPage + 1,
          pageSize,
          ordering: ordering,
          start_date: start,
          end_date: end,
          filter_type: value ? type : null,
          filter_value: value,
          min_mag: minmag,
          max_mag: maxmag
        }).then((res) => {
          const { data } = res
          setTableData(
            data.results.map((row) => ({
              key: row.id,
              detail: `/occultation-detail/${row.id}`,
              //map: urlExists(getMapUrl(row)) ? getMapUrl(row) : '',
              ...row
            }))
          )
          setTotalCount(data.count)
        })
      }

    }
  }

  useEffect(() => {
    if (!isMount) {
      loadData({ sorting: [{ columnName: 'date_time', direction: 'asc' }], pageSize: 10, currentPage: 0 });
    }
  }, [filterView]);

  useEffect(() => {
    if (!isMount && filterView === 'period') {
      loadData({ sorting: [{ columnName: 'date_time', direction: 'asc' }], pageSize: 10, currentPage: 0 });
    }
  }, [dateStart, dateEnd]);

  const filter = () => {
    setErroLocation(false);
    loadData({ sorting: [{ columnName: 'date_time', direction: 'asc' }], pageSize: 10, currentPage: 0 });
  }

  return (
    <>
      <br></br><br></br>
      <Grid container spacing={1} mt="3">
        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('')}>
          <div className={clsx(filterView === '' ? classes.selected : classes.celula)}>All events</div>
        </Grid>

        <Grid item xs={6} sm={3} className={classes.mouse} onClick={() => setFilterView('userSelect')}>
          <div className={clsx(filterView === 'userSelect' ? classes.selected : classes.celula)}>User Selected</div>
        </Grid>
      </Grid>
      {filterView === 'period' &&
        <><br></br><Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <form noValidate autoComplete="off">
                  <Grid container spacing={2} alignItems='stretch'>
                    <Grid item xs={12} sm={4} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth ><label>Date Start</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateStart} onChange={date => { setDateStart(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={7} sm={4} md={3}>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth><label>Date End</label>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker format="YYYY-MM-DD" value={dateEnd} onChange={date => { setDateEnd(date) }} />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid></>
      }
      {filterView === 'userSelect' &&
        <><br></br>
          <OccultationFilter
            dateStart={dateStart}
            setDateStart={setDateStart}
            dateEnd={dateEnd}
            setDateEnd={setDateEnd}
            filterType={filterType}
            setFilterType={setFilterType}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            magnitude={magnitude}
            setMagnitude={setMagnitude}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            radius={radius}
            setRadius={setRadius}
            geoFilter={geoFilter}
            setGeoFilter={setGeoFilter}
            loadingLocation={loadingLocation}
            setLoadingLocation={setLoadingLocation}
            erroLocation={erroLocation}
            setErroLocation={setErroLocation}
            filter={filter}
          />
        </>
      }
      <br></br>
      <Grid item xs={12}>
          <OccultationTable
            loadData={loadData}
            tableData={tableData}
            totalCount={totalCount}
            publicPage={true}
          />
      </Grid>
    </>
  )
}

export default PublicOcutation
