import moment from 'moment';
import axios from 'axios';

// export const url = 'http://tno-testing.linea.gov.br/api';

export const url = 'http://localhost/api';
axios.defaults.baseURL = url;
axios.defaults.headers.common['Authorization'] = 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c';
// axios.interceptors.request.use((config) => {
//   const token = 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c';
//   config.headers.Authorization = token;
//   return config;
// });
// Token ea6810e9f05149cb5f1b3dfa349599170bf1c44e
export const createSkybotRun = ({
  type_run,
  date_initial,
  date_final,

}) => {


  date_initial = date_initial !== '' ? moment(date_initial).format('YYYY-MM-DD') : null;
  date_final = date_final !== '' ? moment(date_final).format('YYYY-MM-DD') : null;


  return axios.post(`/skybot_run/`, {
    type_run: type_run,
    status: 'pending',
    date_initial: date_initial,
    date_final: date_final,

  });
};


export const getSkybotRunById = ({ id }) => {
  return axios.get(`/skybot_run/${id}`, { headers: { "Authorization": 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c' } });
};


export const getSkybotRunList = ({ page, pageSize, sortField, sortOrder }) => {

  let ordering = sortField;
  if (sortOrder === -1) {
    ordering = '-' + sortField;
  }

  const params = {
    page: page,
    pageSize: pageSize,
    ordering: ordering,
  };

  return axios.get(`/skybot_run/`,  {params: params});
};