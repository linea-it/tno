import { api } from './Api'

export const createOrbitTraceJob = ({ date_initial, date_final, bsp_planetary, leap_second, filter_type, filter_value }) => {
  const params = {
    date_initial: date_initial,
    date_final: date_final,
    bsp_planetary: bsp_planetary,
    leap_second: leap_second,
    filter_type: filter_type,
    filter_value: filter_value
  }

  return api.post('/des/orbit_trace_job/submit_job/', params)
}

export const getOrbitTraceJobList = ({ page, pageSize, ordering }) => {
  const params = {
    page,
    pageSize,
    ordering
  }

  return api.get('/des/orbit_trace_job/', { params })
}

export const getOrbitTraceJobById = ({ id }) => api.get(`/des/orbit_trace_job/${id}`).then((res) => res.data)

export const getOrbitTraceJobStatusById = ({ id }) => api.get(`/des/orbit_trace_job/${id}/status`).then((res) => res.data)

export const getLeapSecondList = () => api.get(`/leap_second/`).then((res) => res.data.results)

export const getBspPlanetaryList = () => api.get(`/bsp_planetary/`).then((res) => res.data.results)

export const getFilterValueList = () => api.get(`/asteroids/dynclasses/`).then((res) => res.data.results)

export const getFilterTypeList = () => api.get(`/asteroids/base_dynclasses/`).then((res) => res.data.results)
