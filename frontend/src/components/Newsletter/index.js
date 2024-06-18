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
import { listPreferenceEventFilters, saveListPreferenceEventFilters} from '../../services/api/Newsletter'
import AsteroidSelect from '../AsteroidSelect/AsteroidSelect'
import MaginitudeSelect from '../MaginitudeSelect/index'
import MaginitudeDropSelect from '../MaginitudeDropSelect/index'
import SolarTimeFilter from '../SolarTimeFilter'
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
            filter_type: queryOptions.filters.filterType, 
            filter_value: queryOptions.filters.filterValue 
        } ).then(() => {
        console.log('salvando nome do filtro no bd')})
        //console.log(queryOptions.filters.frequency)
        //console.log(queryOptions.filters.filter_name)
    }

    return (
        <Box component="form" onSubmit={handleSubmit} autoComplete='off' noValidate>
            <Box>
            <Grid container spacing={2} alignItems='center' >
                <Grid item xs={12} >
                    <CardContent>
                    <TextField sx={{ padding: '20px' }}
                        margin="normal"
                        required
                        fullWidth
                        id="filter_name"
                        label="Filter Name"
                        name="filter_name"
                        autoComplete="filter_name"
                        autoFocus sx={{ input: { borderRadius: '6px', height:'8px', color: 'gray' }}}
                        value={filterName}
                        onChange={nameChangeHandler}
                        InputLabelProps={{ sx: { color: 'gray' } }}
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
                        value={queryOptions.filters.maginitudeMax}
                        onChange={(event) => {
                            setQueryOptions((prev) => {
                            return {
                                ...prev,
                                filters: {
                                ...prev.filters,
                                maginitudeMax: event.target.value
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
                                return {
                                    ...prev,
                                    filters: {
                                    ...prev.filters,
                                    ...value
                                    }
                                }
                                })
                            }}
                            ></SolarTimeFilter>
                            </Grid>
                            </CardContent>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <CardContent>
                            <Grid item xs={12} container>
                            <Grid item xs={3} container sx={{ padding: '8px' }}>
                                <MaginitudeDropSelect
                                value={queryOptions.filters.maginitudeDropMin}
                                onChange={(newValue) => {
                                    setQueryOptions((prev) => {
                                    return {
                                        ...prev,
                                        filters: {
                                        ...prev.filters,
                                        maginitudeDropMin: newValue
                                        }
                                    }
                                    })
                                }}
                                />
                            </Grid>
                            <Grid item xs={3} container sx={{ padding: '8px' }}>
                                <EventDurationField
                                value={queryOptions.filters.eventDurationMin}
                                onChange={(value) => {
                                    setQueryOptions((prev) => {
                                        return {
                                            ...prev,
                                            filters: {
                                                ...prev.filters,
                                                eventDurationMin: value
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
        </Box>
    )
}
