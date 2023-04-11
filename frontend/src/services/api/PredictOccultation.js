import { api } from './Api'

export const createPredictionJob = ({ date_initial, date_final, filter_type, filter_value, predict_step, force_refresh_input, input_days_to_expire, catalog}) => {
  const params = {
    date_initial: date_initial,
    date_final: date_final,
    filter_type: filter_type,
    filter_value: filter_value,
    predict_step: predict_step,
    force_refresh_input: force_refresh_input,
    input_days_to_expire: input_days_to_expire,
    catalog: catalog
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


export const getPredictionJobResultsById = ({ id, pageSize, page, ordering }) => {
  const params = {
    job: id,
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


