import moment from 'moment';
import axios from 'axios';

// TODO essa variavel ja existe no auth (api) nao precisa repetir
export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 2c68c902fd81d383aca48ff17b92435f890a130d';
  config.headers.Authorization = token;
  return config;
});

export const createSkybotRun = ({
  type_run,
  date_initial,
  date_final,

}) => {
  date_initial = date_initial !== '' ? moment(date_initial).format('YYYY-MM-DD') : null;
  date_final = date_final !== '' ? moment(date_final).format('YYYY-MM-DD') : null;


  return axios.post('/skybot_run/', {
    type_run,
    status: 'pending',
    date_initial,
    date_final,

  });
};

export const getSkybotRunById = ({ id }) => axios.get(`/skybot_run/${id}`).then((res) => res.data);

export const getSkybotRunList = ({
  page, pageSize, sortField, sortOrder,
}) => {
  let ordering = sortField;
  if (sortOrder === -1) {
    ordering = `-${sortField}`;
  }

  const params = {
    page,
    pageSize,
    ordering,
  };

  return axios.get('/skybot_run/', { params });
};

export const getStatistic = ({ id }) => axios.get('/skybot_run/statistic/', {
  params: { run_id: id },
}).then((res) => res.data);

export const getSkybotRunResults = ({
  id, page, pageSize, search,
}) => {
  const params = {
    run_id: id, page, pageSize, search,
  };
  return axios.get('/skybot_run/results/', { params }).then((res) => res.data);
};
