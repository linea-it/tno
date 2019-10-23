import axios from 'axios';

export const url = process.env.REACT_APP_API;

axios.defaults.baseURL = url;

export const getStatsById = ({ id }) => {
  const params = { id };
  return axios.get('/customlist/get_stats', { params }).then((res) => res.data.data);
};

export const getObjectsList = ({ tablename, page, pageSize }) => axios.get('/customlist/list_objects/', {
  params: { tablename, page, pageSize },
}).then((res) => res.data);
