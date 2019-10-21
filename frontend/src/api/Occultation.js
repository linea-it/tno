import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';


axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c';
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

  return axios.get(`/occultation/`, {
    params,
  }).then((res) => res.data);
};

export const getOccultationById = ({ id }) => axios.get(`${this.api}/occultation/${id}/`).then((res) => res.data);
