import axios from 'axios';
import moment from 'moment';

export const createSkybotRun = ({ date_initial, date_final }) => {
  const params = {
    type_run: 'period',
    status: 'pending',
    date_initial: moment(date_initial).format('YYYY-MM-DD'),
    date_final: moment(date_final).format('YYYY-MM-DD'),
  };

  return axios.post('/skybot_run/', { params });
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

export const getStatistic = ({ id }) =>
  axios
    .get('/skybot_run/statistic/', {
      params: { run_id: id },
    })
    .then((res) => res.data);

export const getSkybotRunResults = ({ id, page, pageSize, search }) => {
  const params = {
    run_id: id,
    page,
    pageSize,
    search,
  };
  return axios.get('/skybot_run/results/', { params }).then((res) => res.data);
};

export const getExposurePlot = (skybotrun, expnum) =>
  axios
    .get('/skybot_run/skybot_output_plot/', {
      params: { run_id: skybotrun, expnum },
    })
    .then((res) => res.data);

export const getOutputByExposure = (run_id, expnum) =>
  axios
    .get('/skybot_run/skybot_output_by_exposure/', {
      params: { run_id, expnum },
    })
    .then((res) => res.data);

export const getAsteroidsInsideCCD = (expnum) =>
  axios
    .get('/skybot_run/asteroids_ccd/', {
      params: { expnum },
    })
    .then((res) => res.data);

export const getSkybotRunEstimate = (initialDate, finalDate) =>
  axios
    .get('/skybot_run/execution_time_estimate/', {
      params: { initial_date: initialDate, final_date: finalDate },
    })
    .then((res) => res.data);

export const getExposuresByPeriod = (initialDate, finalDate) =>
  axios
    .get('/skybot_run/exposures_by_period/', {
      params: { initial_date: initialDate, final_date: finalDate },
    })
    .then((res) => res.data);

export const getYearsWithExposure = () =>
  axios.get('/skybot_run/exposures_years/').then((res) => res.data);

export const stopSkybotRunById = (id) =>
  axios
    .patch(`/skybot_run/${id}/`, {
      status: 'canceled',
    })
    .then((res) => res);

export const getSkybotProgress = (id) =>
  axios.get(`/des/skybot_job/${id}/heartbeat/`).then((res) => res.data);
