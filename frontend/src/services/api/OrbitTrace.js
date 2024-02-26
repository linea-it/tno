import { api } from './Api'

export const createOrbitTraceJob = ({
  bsp_planetary,
  leap_second,
  filter_type,
  filter_value,
  parsl_init_blocks,
  bps_days_to_expire,
  debug
}) => {
  const params = {
    bsp_planetary: bsp_planetary,
    leap_second: leap_second,
    filter_type: filter_type,
    filter_value: filter_value,
    // parsl_init_blocks: parsl_init_blocks,
    // bps_days_to_expire: bps_days_to_expire,
    debug: debug
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

export const getOrbitTraceJobStatusById = ({ id }) => api.get(`/des/orbit_trace_job/${id}/status_display`).then((res) => res.data)

export const getOrbitTraceProgressById = ({ id }) => api.get(`/des/orbit_trace_job/${id}/status`).then((res) => res.data)

export const getLeapSecondList = () => api.get(`/leap_second/`).then((res) => res.data.results)

export const getBspPlanetaryList = () => api.get(`/bsp_planetary/`).then((res) => res.data.results)

export const getOrbitTraceResultByJobId = ({ id, pageSize, page, ordering }, successed) => {
  const params = {
    job: id,
    status: successed ? 1 : 2,
    page,
    pageSize,
    ordering
  }

  return api.get(`/des/orbit_trace_job_result/`, { params }).then((res) => res.data)
}

export const getOrbitTraceJobResultById = (id) => api.get(`/des/orbit_trace_job_result/${id}/`).then((res) => res.data)

export const getObservationByAsteroid = ({ asteroid_id, pageSize, page, ordering }) => {
  const params = {
    asteroid_id: asteroid_id,
    page,
    pageSize,
    ordering
  }
  return api.get(`/des/observation/`, { params }).then((res) => res.data)
}

export const getPlotObservationByAsteroid = (name) => {
  if (!name) {
    return
  }
  return api.get(`/des/observation/plot_by_asteroid/?name=${name}`).then((res) => res.data)
}

export const cancelOrbitTraceJobById = (id) => api.post(`/des/orbit_trace_job/${id}/cancel_job/`).then((res) => res.data)
