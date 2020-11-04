import axios from 'axios';

export const getResultsByYear = () =>
  axios.get('/des/dashboard/skybot_by_year/')
    .then(res => res.data.results)

export const getResultsByDynclass = () =>
  axios.get('/des/dashboard/skybot_by_dynclass/')
    .then(res => res.data.results)
