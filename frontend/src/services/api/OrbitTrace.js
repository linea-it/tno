import { api } from './Api'

export const createOrbitTraceJob = ({ bsp_planetary, leap_second, filter_type, filter_value, debug, bps_days_to_expire}) => {
  const params = {
    bsp_planetary: bsp_planetary,
    leap_second: leap_second,
    filter_type: filter_type,
    filter_value: filter_value,
    debug: debug,
    bps_days_to_expire: bps_days_to_expire
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

export const getDynClassList = () => api.get(`/asteroids/dynclasses/`).then((res) => res.data.results)

export const getBaseDynClassList = () => api.get(`/asteroids/base_dynclasses/`).then((res) => res.data.results)

export const getAsteroidsList = () => api.get(`/asteroids/`).then((res) => res.data.results)

export const getOrbitTraceResultById = ({ id, pageSize, page }) => {
  const params = {
    job: id,
    page,
    pageSize,
  }

  return api.get(`/des/orbit_trace_job_result/`, { params }).then((res) => res.data)
}

export const getOrbitTraceJobResultById = (id) => api.get(`/des/orbit_trace_job_result/${id}/`).then((res) => res.data)

export const getObservationByAsteroid = ({ asteroid_id, pageSize, page }) =>{
  const params = {
    asteroid_id: asteroid_id,
    page,
    pageSize,
  }
 return api.get(`/des/observation/${asteroid_id}/get_by_asteroid/?format=json`).then((res) => res.data)
}

export const cancelOrbitTraceJobById = (id) => api.post(`/des/orbit_trace_job/${id}/cancel_job/`).then((res) => res.data)

