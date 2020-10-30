import axios from 'axios';

export const getResultsByYear = () =>
  axios.get('/dashboard/skybot_year_result/')
    .then(res => res.data.results)

export const getResultsByDynclass = () =>
  axios.get('/dashboard/skybot_dynclass_result/')
    .then(res => res.data.results)
