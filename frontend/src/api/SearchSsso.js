
import axios from 'axios';

// export const url = 'http://tno-testing.linea.gov.br/api';

// TODO essa variavel ja existe no auth (api) nao precisa repetir
export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 2c68c902fd81d383aca48ff17b92435f890a130d';
  config.headers.Authorization = token;
  return config;
});


export const getSkybotLists = ({ page, pageSize, search, filters }) => {
  const params = { page: page, pageSize: pageSize, search: search };


  filters.forEach(function (el) {
    params[el.property] = el.value;

  });

  return axios.get(`/skybotoutput/`, { params: params });
}


