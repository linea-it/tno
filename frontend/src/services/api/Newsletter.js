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
  // Fix Time format
  if (data.local_solar_time_after) {
    data.local_solar_time_after = data.local_solar_time_after.format('HH:mm:ss')
  }
  if (data.local_solar_time_before) {
    data.local_solar_time_before = data.local_solar_time_before.format('HH:mm:ss')
  }

  return api.post(`/event_filter/`, { ...data })
}

export const userEventFilterbUpdate = ({ id, data }) => api.patch(`/event_filter/${id}/`, { ...data })

export const userEventFilterDelete = ({ id }) => api.delete(`/event_filter/${id}`)

// ----------------------------------------------------------
