import { api } from './Api'

// ----------------------------------------------------------
// Newsletter Subscription API
// ----------------------------------------------------------
export const subscribe = (email) => {
  return api.post('/subscription/', { email: email })
}
export const unsubscribe = () => api.post(`/subscription/unsubscribe/`)

export const reactivateSubscription = () => api.post(`/subscription/reactivate/`)

export const getSubscriptionInfo = () => api.get(`/subscription/info/`)

// ----------------------------------------------------------
// Public User Preferences API
// ----------------------------------------------------------
export const getUserEventFilters = ({ queryKey }) => {
  const params = queryKey[1]
  const { paginationModel, sortModel } = params
  const { pageSize } = paginationModel
  // Fix Current page
  let page = paginationModel.page + 1

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

  return api.get(`/event_filter/`, { params: { page, pageSize, ordering } }).then((res) => res.data)
}

export const getUserEventFilterbById = ({ id }) => api.get(`/event_filter/${id}`)

export const userEventFilterbCreate = ({ data }) => {
  const newData = { ...data }

  newData.filter_name = data.filter_name

  // Filtro por Nome, Dynclass e Base Dynclass
  if (data.filter_value !== undefined && data.filter_value !== '') {
    if (data.filter_type === 'name') {
      newData.filter_value = data.filter_value.map((row) => row.name).join(',')
    } else {
      newData.filter_value = data.filter_value
    }
  }

  // Fix Time format
  if (data.local_solar_time_after) {
    newData.local_solar_time_after = data.local_solar_time_after.format('HH:mm:ss')
  }
  if (data.local_solar_time_before) {
    newData.local_solar_time_before = data.local_solar_time_before.format('HH:mm:ss')
  }

  // Filtro por magnitude maxima
  newData.magnitude_max = data.maginitudeMax

  // Filtro por magnitude Drop Maior que
  if (data.maginitude_drop_max !== undefined && data.maginitude_drop_max !== '') {
    newData.magnitude_drop_max = data.maginitude_drop_max
  }

  // Filtro por Event Duration Maior que
  if (data.event_duration !== undefined && data.event_duration !== '') {
    newData.event_duration = data.event_duration
  }

  if (data.closest_approach_uncertainty_km !== undefined && data.closest_approach_uncertainty_km !== '') {
    newData.closest_approach_uncertainty_km = data.closest_approach_uncertainty_km
  }

  console.log('data newsletter', newData)
  return api.post(`/event_filter/`, { ...newData })
}

export const userEventFilterbUpdate = ({ id, data }) => {
  const newData = { ...data }

  newData.filter_name = data.filter_name

  // Filtro por Nome, Dynclass e Base Dynclass
  if (data.filter_value !== undefined && data.filter_value !== '') {
    if (data.filter_type === 'name') {
      newData.filter_value = data.filter_value.map((row) => row.name).join(',')
    } else {
      newData.filter_value = data.filter_value
    }
  }

  // Fix Time format
  if (data.local_solar_time_after) {
    newData.local_solar_time_after = data.local_solar_time_after.format('HH:mm:ss')
  }
  if (data.local_solar_time_before) {
    newData.local_solar_time_before = data.local_solar_time_before.format('HH:mm:ss')
  }

  // Filtro por magnitude maxima
  newData.magnitude_max = data.maginitudeMax

  // Filtro por magnitude Drop Maior que
  if (data.maginitude_drop_max !== undefined && data.maginitude_drop_max !== '') {
    newData.magnitude_drop_max = data.maginitude_drop_max
  }

  // Filtro por Event Duration Maior que
  if (data.event_duration !== undefined && data.event_duration !== '') {
    newData.event_duration = data.event_duration
  }

  if (data.closest_approach_uncertainty_km !== undefined && data.closest_approach_uncertainty_km !== '') {
    newData.closest_approach_uncertainty_km = data.closest_approach_uncertainty_km
  }

  return api.patch(`/event_filter/${id}/`, { ...newData })
}

export const userEventFilterDelete = ({ id }) => api.delete(`/event_filter/${id}`)

// ----------------------------------------------------------
