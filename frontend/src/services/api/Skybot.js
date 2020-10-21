import axios from 'axios';

export const createSkybotRun = ({ date_initial, date_final }) => {
  const params = {
    date_initial: date_initial,
    date_final: date_final,
  };

  return axios.post('/des/skybot_job/submit_job/', params);
};

export const getSkybotRunById = ({ id }) =>
  axios.get(`/des/skybot_job/${id}`).then((res) => res.data);

export const getSkybotRunList = ({ page, pageSize, ordering }) => {
  const params = {
    page,
    pageSize,
    ordering,
  };

  return axios.get('/des/skybot_job/', { params });
};

export const getExposuresByPeriod = (initialDate, finalDate) =>
  axios
    .get('/des/exposure/count_by_period/', {
      params: { start: initialDate, end: finalDate },
    })
    .then((res) => res.data);

export const getExecutedNightsByPeriod = (initialDate, finalDate) =>
  axios
    .get('/des/skybot_job_result/nites_executed_by_period/', {
      params: { start: initialDate, end: finalDate },
    })
    .then((res) => res.data);

export const getNightsSuccessOrFail = (id) =>
  axios
    .get(`/des/skybot_job/${id}/nites_success_or_fail/`)
    .then((res) => res.data);

export const getSkybotProgress = (id) =>
  axios.get(`/des/skybot_job/${id}/heartbeat/`).then((res) => res.data);

export const getSkybotResultById = ({ id, pageSize, page, ordering }) => {
  const params = {
    job: id,
    page,
    pageSize,
    ordering,
  };

  const foreign_keys_ordering = ['exposure__date_obs'];

  foreign_keys_ordering.forEach(key => {
    const field = key.split('__')[1];
    const isDesc = ordering.indexOf('-') === 0;

    if(ordering.indexOf(field) > -1) {
      params.ordering =  isDesc ? `-${foreign_keys_ordering[0]}` : foreign_keys_ordering[0];
    }
  });

  return axios
    .get(`/des/skybot_job_result/`, { params })
    .then((res) => res.data);
};

export const getSkybotTimeProfile = (id) =>
  axios.get(`/des/skybot_job/${id}/time_profile/`).then((res) => res.data);

export const getSkybotJobResultById = (id) =>
  axios.get(`/des/skybot_job_result/${id}/`).then((res) => res.data);

export const getPositionsByTicket = (ticket) => {
  const params = { ticket, page: 1, pageSize: 9999 };

  return axios.get('/skybot/position/', { params }).then((res) => res.data);
};

export const getAsteroidsInsideCcdByTicket = (ticket) => {
  const params = { ticket, page: 1, pageSize: 9999 };

  return axios.get('/des/skybot_position/', { params }).then((res) => res.data);
};

export const getCcdsByExposure = (exposure) => {
  const params = { exposure };

  return axios.get('/des/ccd/', { params }).then((res) => res.data);
};

export const getExposureById = (id) =>
  axios.get(`/des/exposure/${id}`).then((res) => res.data);

export const cancelSkybotJobById = (id) =>
  axios.post(`/des/skybot_job/${id}/cancel_job/`).then((res) => res.data);

export const getDynclassAsteroidsById = (id) =>
  axios.get(`/des/skybot_job_result/${id}/dynclass_asteroids/`)
    .then((res) => res.data);

export const getDynclassAsteroids = id =>
  axios.get(`/des/skybot_job/${id}/dynclass_counts/`).then(res => res.data)

export const getCcdsWithAsteroidsById = (id) =>
  axios.get(`/des/skybot_job_result/${id}/ccds_with_asteroids/`)
    .then((res) => res.data);

export const getSkybotCalcExecutionTime = exposures =>
  axios.get(`/des/skybot_job/calc_execution_time?to_execute=${exposures}`)
    .then((res) => res.data.estimated_time)
