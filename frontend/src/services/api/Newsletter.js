import { api } from './Api'

export const getSubscriptionInfo = (id) => api.post(`/subscription/info/`, { c: id })


export const unsubscribe = (id) => api.post(`/subscription/unsubscribe/`, { c: id })

export const reactivateSubscription = (id) => api.post(`/subscription/reactivate/`, { c: id })

export const delSubscriptionInfo = (id) => {
  console.log(id)
  return api.delete(`/newsletter/preferences/${id}`).then((res) => res.data)
}

export const listPreferenceEventFilters = ({ queryKey }) => {
  const params = queryKey[1]
  
  const { subscriptionId } = params
  if (!subscriptionId) {
    return
  }

  return api.get(`newsletter/preferences`, { subscription_id: subscriptionId }).then((res) => res.data)
}

// função que trata os dados antes de enviar para o banco
export const geoFilterIsValid = (value) => {
  if (value.geo) {
    if (value.latitude === undefined || value.latitude === '') {
      return false
    }
    if (value.latitude < -90 || value.latitude > 90) {
      return false
    }

    if (value.longitude === undefined || value.longitude === '') {
      return false
    }

    if (value.longitude < -180 || value.longitude > 180) {
      return false
    }
  }
  return true
}

/*
const parsePredictEventsFilters = (params) => {
  //const { paginationModel, filters, sortModel, search } = params
  //const { pageSize } = paginationModel
  //const { filters } = params
  console.log(params)
  const filters = params

    
  // Fix Current page
  //let page = paginationModel.page + 1

  /*
  // Parse Sort options
  let sortFields = []
  if (sortModel !== undefined && sortModel.length > 0) {
    sortModel.forEach((e) => {
      if (e.sort === 'asc') {
        sortFields.push(e.field)
      } else {
        sortFields.push(`-${e.field}`)
      }
    })
  }
  let ordering = sortFields.length !== 0 ? sortFields.join(',') : null
  
  const newFilters = {}
  if (filters !== undefined) {
    
    // dont work
    //newFilters.subscription_id= filters.subscription_id
    //newFilters.filter_name= filters.filter_name
    //newFilters.frequency= filters.frequency
    //newFilters.latitude= filters.latitude
    

    // Filtro por periodo
    newFilters.date_time_after = filters.date_time_after
    newFilters.date_time_before = filters.date_time_before
    

    // Filtro por Nome, Dynclass e Base Dynclass
    if (filters.filter_value !== undefined && filters.filter_value !== '') {
      if (filters.filter_type === 'name') {
        newFilters['name'] = filters.filter_value.map((row) => row.name).join(',')
      } else {
        newFilters[filters.filter_type] = filters.filter_value
      }
    }

    // Filtro por magnitude maxima
    newFilters.magnitude_max = filters.magnitude

    // Filtro por magnitude Drop Maior que
    if (filters.magnitude_drop !== undefined && filters.magnitude_drop !== '') {
      newFilters.magnitude_drop = filters.magnitude_drop
    }

    // Filtro por Event Duration Maior que
    if (filters.event_duration !== undefined && filters.event_duration !== '') {
      newFilters.event_duration = filters.event_duration
    }

    // Filtro por Object Diameter Range min, max
    if (filters.diameter_min !== undefined && filters.diameter_min !== '') {
      newFilters.diameter_min = filters.diameter_min
    }

    if (filters.diameter_max !== undefined && filters.diameter_max !== '') {
      newFilters.diameter_max = filters.diameter_max
    }

    // Filtro por Local Solar Time
    if (filters.solar_time_enabled === true) {
      if (filters.local_solar_time_after !== undefined && filters.local_solar_time_before !== '') {
        if (filters.local_solar_time_after.isValid() && filters.local_solar_time_before.isValid()) {
          newFilters.local_solar_time_after = filters.local_solar_time_after.format('HH:mm:ss')
          newFilters.local_solar_time_before = filters.local_solar_time_before.format('HH:mm:ss')
        }
      }
    }

    
    // Filtro por Nighside
    // Caso Nighside seja false ignora esse filtro. se não o backend vai retornar apenas resultados nightside = false.
    newFilters.nightside = filters.nightside === true ? true : null
    

    // GEO Filter
    if (filters.geo_location === true && geoFilterIsValid(filters)) {
      newFilters.latitude = filters.latitude
      newFilters.longitude = filters.longitude
      newFilters.location_radius = filters.location_radius
    }

    
    // Filtro por Jobid
    if (filters.jobid) {
      newFilters.jobid = filters.jobid
    }
  }
  //return { params: { page, pageSize, ordering, ...newFilters, search } }
  //return { params: newFilters }
  //console.log(newFilters.subscription_id)
  return newFilters 
}*/

const parsePredictEventsFilters = (params1) => {
  const filters = params1
  const newFilters = {}
  console.log(params1)

  //Filtro por frequencia
  /*if (filters.frequency === '1') {
    newFilters.frequency = 'Monthly'
  } else {
    newFilters.frequency = 'Weekly'
  }*/

  newFilters.subscription_id= filters.subscription_id
  newFilters.filter_name = filters.filter_name
  newFilters.frequency = filters.frequency
  newFilters.filter_type = filters.filter_type
  newFilters.magnitude_min = filters.magnitude_min
  newFilters.magnitude_max = filters.magnitude_max
  
  // Filtro por Nome, Dynclass e Base Dynclass
  if (filters.filter_value !== undefined && filters.filter_value !== '') {
    if (filters.filter_type === 'name') {
      newFilters['name'] = filters.filter_value.map((row) => row.name).join(',')
      newFilters.filter_value = newFilters.name
    } else {
      newFilters[filters.filter_type] = filters.filter_value
      newFilters.filter_value = filters.filter_value
    }
  }

  // Filtro por Local Solar Time
  //if (filters.solar_time_enabled === true) {
    if (filters.local_solar_time_after !== undefined && filters.local_solar_time_before !== '') {
      if (filters.local_solar_time_after.isValid() && filters.local_solar_time_before.isValid()) {
        newFilters.local_solar_time_after = filters.local_solar_time_after.format('HH:mm:ss')
        newFilters.local_solar_time_before = filters.local_solar_time_before.format('HH:mm:ss')
      }
    }
  //}

  newFilters.magnitude_drop_min = filters.magnitude_drop_min
  newFilters.magnitude_drop_max = filters.magnitude_drop_max
  newFilters.event_duration = filters.event_duration
  newFilters.diameter_min = filters.diameter_min
  newFilters.diameter_max = filters.diameter_max
  //newFilters.geo_location = filters.geo_location
  newFilters.latitude = filters.latitude
  newFilters.longitude = filters.longitude
  newFilters.location_radius = filters.location_radius
  //newFilters.latitude = filters.latitude
  
  console.log(newFilters)

  return newFilters 
}

export const saveListPreferenceEventFilters = ({ 
  subscriptionId, 
  filter_name,
  frequency,
  magnitude_min, 
  magnitude_max, 
  filter_type, 
  filter_value,
  local_solar_time_after,
  local_solar_time_before,
  magnitude_drop_min,
  magnitude_drop_max,
  event_duration,
  diameter_min,
  diameter_max,
  //geo_location,
  latitude,
  longitude,
  altitude,
  location_radius 
}) => {
  const params = { 
    subscription_id: subscriptionId, 
    filter_name: filter_name,
    frequency: frequency,
    magnitude_min: magnitude_min, 
    magnitude_max: magnitude_max, 
    filter_type: filter_type,
    filter_value: filter_value,
    local_solar_time_after: local_solar_time_after,
    local_solar_time_before: local_solar_time_before,
    magnitude_drop_min: magnitude_drop_min,
    magnitude_drop_max: magnitude_drop_max,
    event_duration: event_duration,
    diameter_min: diameter_min,
    diameter_max: diameter_max,
    //geo_location: geo_location,
    latitude: latitude,
    longitude: longitude,
    altitude: altitude,
    location_radius: location_radius  
 }
  console.log(params)
  const paramsOut = parsePredictEventsFilters(params)
  console.log(paramsOut)
  console.log("passando pela api saveListPreferenceEventFilters")
  //return api.post(`newsletter/preferences/`, params )//.then((res) => res.data.results)
  return api.post(`newsletter/preferences/`, paramsOut )//.then((res) => res.data.results)
}