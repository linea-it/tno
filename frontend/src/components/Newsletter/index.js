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
import GeoFilter from './GeoFilter/index'
import ObjectDiameterFilter from '../ObjectDiameterFilter/index'
import EventDurationField from '../EventDurationField/index'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import FrequencySelect from './Frequency/FrequencySelect'
import AltitudeField from './AltitudeField/index';

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
              magnitude_min: queryOptions.filters.magnitude_min, 
              magnitude_max: queryOptions.filters.magnitude_max, 
              filter_type: queryOptions.filters.filterType, 
              filter_value: queryOptions.filters.filterValue,
              local_solar_time_after: queryOptions.filters.local_solar_time_after,
              local_solar_time_before: queryOptions.filters.local_solar_time_before,
              magnitude_drop_min: queryOptions.filters.magnitude_drop_min,
              magnitude_drop_max: queryOptions.filters.magnitude_drop_max,
              event_duration:  queryOptions.filters.event_duration,
              diameter_min: queryOptions.filters.diameter_min,
              diameter_max: queryOptions.filters.diameter_max,
              //geo_location: queryOptions.filters.geo_location,
              altitude: queryOptions.filters.altitude,
              latitude: queryOptions.filters.latitude,
              longitude: queryOptions.filters.longitude,
              location_radius: queryOptions.filters.location_radius 
            } ).then(() => {
                console.log('salvando nome do filtro no bd')})
                console.log(queryOptions.filters.frequency)
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
                                                ...value,
                                                filter_type:queryOptions.filters.filterType, //Object.getOwnPropertyDescriptor(value, "name"),
                                                filter_value: queryOptions.filters.filterValue //Object.getOwnPropertyDescriptor(value, "name")
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
                            <Grid item xs={12} alignItems='center' sx={{ display: 'flex', flexDirection: 'rown' }}> 
                                <Grid item xs={12} sx={{ paddingRight: '8px' }}>
                                <MaginitudeSelect
                                    value={queryOptions.filters.magnitude_min}
                                    onChange={(event) => {
                                        setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            magnitude_min: event.target.value
                                            //...value
                                            }
                                        }
                                        })
                                    }}
                                />
                                </Grid>
                                <Grid item xs={12}>
                                <MaginitudeSelect
                                    value={queryOptions.filters.magnitude_max}
                                    onChange={(event) => {
                                        setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            magnitude_max: event.target.value
                                            //...value
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
                                <SolarTimeFilter
                                    value={{
                                        solar_time_enabled: queryOptions.filters.solar_time_enabled,
                                        solar_time_after: queryOptions.filters.solar_time_after,
                                        solar_time_before: queryOptions.filters.solar_time_before
                                    }}
                                    onChange={(value) => {
                                        setQueryOptions((prev) => {
                                            console.log(queryOptions.filters.solar_time_after)
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            //...value,
                                            
                                            //local_solar_time_after: Object.getOwnPropertyDescriptor(value, "solar_time_after").value,
                                            //local_solar_time_before: Object.getOwnPropertyDescriptor(value, "solar_time_before").value,
                                            solar_time_enabled: queryOptions.filters.solar_time_enabled,
                                            local_solar_time_after: queryOptions.filters.solar_time_after,
                                            local_solar_time_before: queryOptions.filters.solar_time_before
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
                                        value={queryOptions.filters.magnitude_drop_min}
                                        onChange={(newValue) => {
                                            setQueryOptions((prev) => {
                                            return {
                                                ...prev,
                                                filters: {
                                                ...prev.filters,
                                                magnitude_drop_min: newValue
                                                }
                                            }
                                            })
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3} container sx={{ padding: '8px' }}>
                                    <MaginitudeDropSelect
                                        value={queryOptions.filters.magnitude_drop_max}
                                        onChange={(newValue) => {
                                            setQueryOptions((prev) => {
                                            return {
                                                ...prev,
                                                filters: {
                                                ...prev.filters,
                                                magnitude_drop_max: newValue
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
                                                        //diameter_min: diameterMin,
                                                        //diameter_max: diameterMax
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
                            <Grid item xs={3} container sx={{ padding: '8px' }}>
                                    <AltitudeField
                                        value={queryOptions.filters.altitude}
                                        onChange={(value) => {
                                            setQueryOptions((prev) => {
                                                return {
                                                    ...prev,
                                                    filters: {
                                                        ...prev.filters,
                                                        altitude: value
                                                    }
                                                }
                                            })
                                        }}
                                    />
                                </Grid>
                                <GeoFilter
                                value={{
                                    //geo: queryOptions.filters.geo,
                                    latitude: queryOptions.filters.latitude,
                                    longitude: queryOptions.filters.longitude,
                                    radius: queryOptions.filters.radius
                                }}
                                    onChange={(value) => {
                                        //console.log(Object.getOwnPropertyDescriptor(value, "radius").value)
                                        setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                            ...prev.filters,
                                            ...value,
                                            location_radius: Object.getOwnPropertyDescriptor(value, "radius").value,
                                            //geo_location: Object.getOwnPropertyDescriptor(value, "geo").value,
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