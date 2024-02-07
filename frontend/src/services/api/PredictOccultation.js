import { api } from './Api'

export const createPredictionJob = ({ date_initial, date_final, filter_type, filter_value, predict_step, catalog, debug}) => {
  const params = {
    date_initial: date_initial,
    date_final: date_final,
    filter_type: filter_type,
    filter_value: filter_value,
    predict_step: predict_step,
    catalog: catalog,
    debug: debug
  }

  return api.post('/prediction_job/submit_job/', params)
}

export const getPredictionJobList = ({ page, pageSize, ordering }) => {
  const params = {
    page,
    pageSize,
    ordering
  }

  return api.get('/prediction_job/', { params })
}

export const getPredictionJobById = ({ id }) => api.get(`/prediction_job/${id}`).then((res) => res.data)


export const getPredictionJobResultsByJobId = ({ id, pageSize, page, ordering }, successed) => {
  const params = {
    job: id,
    status: successed?1:2,
    page,
    pageSize,
    ordering
  }

  return api.get(`/prediction_job_result/`, { params }).then((res) => res.data)
}

export const getPredictionJobResultById = (id) => api.get(`/prediction_job_result/${id}/`).then((res) => res.data)

export const getOccultationsByAsteroid = ({ asteroid_id, pageSize, page, ordering }) =>{
  const params = {
    asteroid_id: asteroid_id,
    page,
    pageSize,
    ordering
  }
 return api.get(`/occultations/?format=json`, {params}).then((res) => res.data)
}

export const cancelPredictionJobById = (id) => api.post(`/prediction_job/${id}/cancel_job/`).then((res) => res.data)

export const getPredictionJobProgressById = ({ id }) => api.get(`/prediction_job/${id}/status`).then((res) => res.data)
