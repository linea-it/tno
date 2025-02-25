import { api } from './Api'

export const getPredictionJobList = ({ queryKey }) => {
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

  return api.get(`/prediction_job/`, { params: { page, pageSize, ordering } }).then((res) => res.data)
}

export const getPredictionJobById = ({ id }) => api.get(`/prediction_job/${id}`).then((res) => res.data)

export const getPredictionJobResultsByJobId = ({ id, pageSize, page, ordering }, successed) => {
  const params = {
    job: id,
    page,
    pageSize,
    ordering
  }

  return api.get(`/prediction_job_result/`, { params }).then((res) => res.data)
}

export const getPredictionJobResultsFailuresByJobId = ({ id, pageSize, page, ordering }) => {
  const params = {
    job: id,
    status: 2,
    page,
    pageSize,
    ordering
  }

  return api.get(`/prediction_job_result/`, { params }).then((res) => res.data)
}

export const getPredictionJobResultById = (id) => api.get(`/prediction_job_result/${id}/`).then((res) => res.data)

export const getOccultationsByAsteroid = ({ asteroid_id, pageSize, page, ordering }) => {
  const params = {
    asteroid_id: asteroid_id,
    page,
    pageSize,
    ordering
  }
  return api.get(`/occultations/?format=json`, { params }).then((res) => res.data)
}

export const cancelPredictionJobById = (id) => api.post(`/prediction_job/${id}/cancel_job/`).then((res) => res.data)

export const getPredictionJobProgressById = ({ id }) => api.get(`/prediction_job/${id}/status`).then((res) => res.data)

export const listAllCatalogs = () => api.get(`/catalog/`).then((res) => res.data.results)
export const listAllPlanetaryEphemeris = () => api.get(`/bsp_planetary/`).then((res) => res.data.results)
export const listAllLeapSeconds = () => api.get(`/leap_second/`).then((res) => res.data.results)

export const createPredictionJob = (data) => {
  // console.log('createPredictionJob: %o', data)
  const { predict_start_date, predict_end_date, filterType, filterValue, predict_step, catalog, bsp_planetary, leap_second, debug } = data
  let filter_value = filterValue
  if (filterType === 'name') {
    const names = []
    filterValue.forEach((el) => {
      names.push(el.name)
    })
    filter_value = names.join(',')
  }

  const params = {
    date_initial: predict_start_date.format('YYYY-MM-DD'),
    date_final: predict_end_date.format('YYYY-MM-DD'),
    filter_type: filterType,
    filter_value: filter_value,
    predict_step: predict_step,
    catalog: catalog,
    planetary_ephemeris: bsp_planetary,
    leap_second: leap_second,
    debug: debug
  }

  // console.log('Params: %o', params)
  return api.post('/prediction_job/submit_job/', params)
}
