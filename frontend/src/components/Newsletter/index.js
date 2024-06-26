import React, { useEffect, useState, useContext } from 'react';
import { useQuery } from 'react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { CardHeader } from '@mui/material'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Divider from '@mui/material/Divider'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { listPreferenceEventFilters, saveListPreferenceEventFilters} from '../../services/api/Newsletter'
import AsteroidSelect from '../AsteroidSelect/AsteroidSelect'
import MaginitudeSelect from '../MaginitudeSelect/index'
import MaginitudeDropSelect from '../MaginitudeDropSelect/index'
import SolarTimeFilter from '../SolarTimeFilter/index'
import GeoFilter from '../GeoFilter/index'
import ObjectDiameterFilter from '../ObjectDiameterFilter/index'
import EventDurationField from '../EventDurationField/index'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import FrequencySelect from './FrequencySelect';

export default function NewsletterEventFiltersSettings({ subscriptionId }) {
    const { queryOptions, setQueryOptions, clearFilter } = useContext(PredictionEventsContext)
    const [preferences, setPreferences] = useState([])
    const [filterName, setFilterName] = useState([])
    const [frequency, setFrequency] = React.useState('Monthly')

    //console.log(queryOptions.filters.filterType)
    const { data, isLoading } = useQuery({
      queryKey: ['preferenceEventFilters', { subscriptionId: subscriptionId }],
      queryFn: listPreferenceEventFilters,
      keepPreviousData: true,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnmount: false,
      refetchOnReconnect: false
    })
  
    if (isLoading) {
      return <Box>Loading...</Box>
    }

    // this function for get our title value from the user.
    function nameChangeHandler(event) {
        setFilterName(event.target.value)
        //setFrequency(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const nameFilterList = data.get('filter_name')
        console.log(nameFilterList)
        saveListPreferenceEventFilters( {
            subscriptionId: subscriptionId, 
            filter_name: nameFilterList,
            frequency: queryOptions.filters.frequency,
            magnitude: queryOptions.filters.magnitude, 
            filter_type: queryOptions.filters.filterType, 
            filter_value: queryOptions.filters.filterValue,
            local_solar_time_after: queryOptions.filters.local_solar_time_after,
            local_solar_time_before: queryOptions.filters.local_solar_time_before,
            magnitude_drop: queryOptions.filters.magnitude_drop,
            event_duration:  queryOptions.filters.event_duration,
            diameter_min: queryOptions.filters.diameter_min,
            diameter_max: queryOptions.filters.diameter_max,
            geo_location: queryOptions.filters.geo_location,
            latitude: queryOptions.filters.latitude,
            longitude: queryOptions.filters.longitude,
            altitude: queryOptions.filters.altitude,
            location_radius: queryOptions.filters.location_radius 
        } ).then(() => {
        console.log('salvando nome do filtro no bd')})
        //console.log(queryOptions.filters.frequency)
        //console.log(queryOptions.filters.filter_name)
        //console.log(queryOptions.filters.geo_location)
    }

    return (
        <Box component="form" onSubmit={handleSubmit} autoComplete='off' noValidate>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Grid container spacing={2} alignItems='center' >
                    <Grid item xs={12} >
                        <CardContent>
                            <TextField
                                margin="normal"
                                required
                                name='filter_name'
                                id="filter_name"
                                label="Filter Name"
                                variant='outlined'
                                value={filterName}
                                onChange={nameChangeHandler}
                                fullWidth
                            />
                        </CardContent>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Grid item xs={12} >
                                <FrequencySelect
                                    source={'period'}
                                    value={{
                                    frequency: queryOptions.filters.frequency,
                                    //frequencyValue: queryOptions.filters.frequency
                                    }}
                                    onChange={(value) => {
                                        setQueryOptions((prev) => {
                                            return {
                                            ...prev,
                                            filters: {
                                                ...prev.filters,
                                                ...value
                                            }
                                            }
                                        })
                                    }}
                                />
                            </Grid>
                        </CardContent>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Grid item xs={12} sm={2} md={4}>
                                <MaginitudeSelect
                                    value={queryOptions.filters.magnitude}
                                    onChange={(event) => {
                                        setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            magnitude: event.target.value
                                            //...value
                                            }
                                        }
                                        })
                                    }}
                                />
                            </Grid>
                        </CardContent>
                        <CardContent>
                            <Grid item xs={12} >
                                <AsteroidSelect
                                    source={'prediction'}
                                    value={{
                                        filterType: queryOptions.filters.filterType,
                                        filterValue: queryOptions.filters.filterValue
                                    }}
                                        onChange={(value) => {
                                            setQueryOptions((prev) => {
                                            return {
                                                ...prev,
                                                filters: {
                                                ...prev.filters,
                                                ...value
                                                }
                                            }
                                        })
                                    }}
                                />
                            </Grid>
                        </CardContent>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Grid item xs={12}>
                                <SolarTimeFilter
                                    value={{
                                        solar_time_enabled: queryOptions.filters.solar_time_enabled,
                                        solar_time_after: queryOptions.filters.solar_time_after,
                                        solar_time_before: queryOptions.filters.solar_time_before
                                    }}
                                    onChange={(value) => {
                                        setQueryOptions((prev) => {
                                            //console.log(Object.getOwnPropertyDescriptor(value, "$d" ).value)
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            ...value, 
                                            /*"$D": 25 "$H": 18 "$L": "en" "$M": 5 "$W": 2 
                                                "$d": Date Tue Jun 25 2024 18:00:00 GMT-0300 (Horário Padrão de Brasília) 
                                                "$m": 0 "$ms": 0 "$s": 0 "$u": undefined "$x": Object {  } "$y": 2024*/
                                                
                                            local_solar_time_after: Object.getOwnPropertyDescriptor(value, "solar_time_after").value,
                                            local_solar_time_before: Object.getOwnPropertyDescriptor(value, "solar_time_before").value,
                                            }
                                        }
                                        })
                                    }}
                                    >
                                </SolarTimeFilter>
                            </Grid>
                        </CardContent>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Grid item xs={12} container>
                                <Grid item xs={3} container sx={{ padding: '8px' }}>
                                    <MaginitudeDropSelect
                                        value={queryOptions.filters.magnitude_drop}
                                        onChange={(newValue) => {
                                            setQueryOptions((prev) => {
                                            return {
                                                ...prev,
                                                filters: {
                                                ...prev.filters,
                                                magnitude_drop: newValue
                                                }
                                            }
                                            })
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3} container sx={{ padding: '8px' }}>
                                    <EventDurationField
                                        value={queryOptions.filters.event_duration}
                                        onChange={(value) => {
                                            setQueryOptions((prev) => {
                                                return {
                                                    ...prev,
                                                    filters: {
                                                        ...prev.filters,
                                                        event_duration: value
                                                    }
                                                }
                                            })
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} container sx={{ padding: '8px' }}>
                                    <ObjectDiameterFilter
                                        value={{
                                            diameterMin: queryOptions.filters.diameterMin,
                                            diameterMax: queryOptions.filters.diameterMax
                                        }}
                                        onChange={(value) => {
                                            //console.log(Object.getOwnPropertyDescriptor(value, "diameterMin").value) 
                                            setQueryOptions((prev) => {
                                                return {
                                                    ...prev,
                                                    filters: {
                                                        ...prev.filters,
                                                        ...value,
                                                        diameter_min: Object.getOwnPropertyDescriptor(value, "diameterMin").value,
                                                        diameter_max: Object.getOwnPropertyDescriptor(value, "diameterMax").value,
                                                    }
                                                }
                                            })
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Grid item xs={12}>
                                <GeoFilter
                                value={{
                                    geo: queryOptions.filters.geo,
                                    latitude: queryOptions.filters.latitude,
                                    longitude: queryOptions.filters.longitude,
                                    radius: queryOptions.filters.radius
                                }}
                                    onChange={(value) => {
                                        console.log(Object.getOwnPropertyDescriptor(value, "radius").value)
                                        setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            ...value,
                                            location_radius: Object.getOwnPropertyDescriptor(value, "radius").value,
                                            geo_location: Object.getOwnPropertyDescriptor(value, "geo").value,
                                            }
                                        }
                                        })
                                    }}
                                />
                            </Grid>
                        </CardContent>
                        <Grid item xs={12} sx={{ padding: '10px' }}>
                            <Divider />
                        </Grid>
                        <CardContent>
                            <Button
                                type="submit"
                                fullWidth 
                                variant="contained"
                                sx={{ width: '20vw', height:'34px'}}
                                >
                                Save
                            </Button>
                        </CardContent>
                    </Grid>
                </Grid>
            </Box>
            </LocalizationProvider>
        </Box>
    )
}
