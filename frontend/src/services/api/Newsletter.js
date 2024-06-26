import { api } from './Api'

export const getSubscriptionInfo = (id) => api.post(`/subscription/info/`, { c: id })

export const unsubscribe = (id) => api.post(`/subscription/unsubscribe/`, { c: id })

export const reactivateSubscription = (id) => api.post(`/subscription/reactivate/`, { c: id })

export const listPreferenceEventFilters = ({ queryKey }) => {
  const params = queryKey[1]
  
  const { subscriptionId } = params
  if (!subscriptionId) {
    return
  }

  return api.get(`newsletter/preferences`, { subscription_id: subscriptionId }).then((res) => res.data)
}

// completar todos os paramentros de entrada da tabela
export const saveListPreferenceEventFilters = ({ 
  subscriptionId, 
  filter_name,
  frequency,
  magnitude, 
  filter_type, 
  filter_value,
  local_solar_time_after,
  local_solar_time_before,
  magnitude_drop,
  event_duration,
  diameter_min,
  diameter_max,
  geo_location,
  latitude,
  longitude,
  altitude,
  location_radius 
}) => {
  const params = { 
    subscription_id: subscriptionId, 
    filter_name: filter_name,
    frequency: frequency,
    magnitude: magnitude, 
    filter_type: filter_type,
    filter_value: filter_value,
    local_solar_time_after: local_solar_time_after,
    local_solar_time_before: local_solar_time_before,
    magnitude_drop: magnitude_drop,
    event_duration: event_duration,
    diameter_min: diameter_min,
    diameter_max: diameter_max,
    geo_location: geo_location,
    latitude: latitude,
    longitude: longitude,
    altitude: altitude,
    location_radius: location_radius  
 }
  
  console.log("passando pela api saveListPreferenceEventFilters")
  console.log(params)
  return api.post(`newsletter/preferences/`, params )//.then((res) => res.data.results)
}
