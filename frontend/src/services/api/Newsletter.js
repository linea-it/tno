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

// Função para transformar dados de evento antes do envio
const transformEventFilterData = (data) => {
  const newData = { ...data }

  // Definir filter_name como string e tratar filter_type
  newData.filter_name = data.filter_name || ''
  newData.filter_type = data.filter_type !== undefined ? String(data.filter_type) : ''

  // Ajustar filter_value: usa "" se for null para evitar problemas no backend
  if (newData.filter_type === '') {
    newData.filter_value = ''
  } else if (Array.isArray(data.filter_value)) {
    newData.filter_value = data.filter_value.map((item) => (typeof item === 'object' && item.name ? item.name : item)).join(',')
  } else {
    newData.filter_value = data.filter_value || ''
  }

  // Ajustar formato do tempo (ambos precisam estar definidos pq é um intervalo)
  if (
    data.local_solar_time_after &&
    typeof data.local_solar_time_after.format === 'function' &&
    data.local_solar_time_before &&
    typeof data.local_solar_time_before.format === 'function'
  ) {
    // Ambos os campos têm valores definidos, então formatamos e salvamos
    newData.local_solar_time_after = data.local_solar_time_after.format('HH:mm:ss')
    newData.local_solar_time_before = data.local_solar_time_before.format('HH:mm:ss')
  } else {
    // Se algum dos campos não tiver valor definido, ambos serão null
    newData.local_solar_time_after = null
    newData.local_solar_time_before = null
  }
  // Ajuste de valores para magnitude máxima
  // newData.magnitude_max = data.magnitude_max !== undefined ? data.magnitude_max : null
  newData.magnitude_max = data.magnitude_max !== undefined && data.magnitude_max !== '' ? data.magnitude_max : null
  // Ajuste de valores para magnitude drop
  newData.magnitude_drop_max = data.magnitude_drop_max !== undefined && data.magnitude_drop_max !== '' ? data.magnitude_drop_max : null

  // Ajuste de valores de diametro
  newData.diameter_max = data.diameter_max !== undefined && data.diameter_max !== '' ? data.diameter_max : null
  newData.diameter_min = data.diameter_min !== undefined && data.diameter_min !== '' ? data.diameter_min : null

  // Ajuste do valor da duração do evento
  newData.event_duration = data.event_duration !== undefined && data.event_duration !== '' ? data.event_duration : null

  // Ajuste do valor da incerteza de aproximação
  newData.closest_approach_uncertainty_km =
    data.closest_approach_uncertainty_km !== undefined && data.closest_approach_uncertainty_km !== ''
      ? data.closest_approach_uncertainty_km
      : null

  // Ajuste do valor da altitude
  newData.altitude = data.altitude !== undefined && data.altitude !== '' ? data.altitude : null
  return newData
}

// Função para criar um filtro de evento (POST)
export const userEventFilterbCreate = ({ data }) => {
  const newData = transformEventFilterData(data)

  // console.log('Transformed data for create:', newData)
  return api.post(`/event_filter/`, newData).catch((error) => {
    console.error('Failed to create the filter:', error.response ? error.response.data : error.message)
    throw error
  })
}

// Função para atualizar um filtro de evento (PATCH)
export const userEventFilterbUpdate = ({ id, data }) => {
  const newData = transformEventFilterData(data)

  return api.patch(`/event_filter/${id}/`, newData).catch((error) => {
    console.error('Failed to update the filter:', error.response ? error.response.data : error.message)
    throw error
  })
}

export const userEventFilterDelete = ({ id }) => api.delete(`/event_filter/${id}`)

// ----------------------------------------------------------
