import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';


axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 9718d50273cc9470fc99ad1d0de463815dda3544';
  config.headers.Authorization = token;
  return config;
});


export const getOccultations = (page, pageSize, sortField, sortOrder) => {
  const params = { page, pageSize, ordering: sortField };

  // let ordering = sortField;
  // // if (sortOrder === -1) {
  // //   ordering = '-' + sortField;
  // // }
  // params.ordering = ordering;

  return axios.get('/occultation/', {
    params,
  }).then((res) => res.data);
};

export const getOccultationById = ({ id }) => axios.get(`/occultation/${id}/`).then((res) => res.data);
