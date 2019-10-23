import axios from 'axios';

// TODO essa variavel ja existe no auth (api) nao precisa repetir
export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;

axios.interceptors.request.use((config) => {
  const token = 'Token 9718d50273cc9470fc99ad1d0de463815dda3544';
  config.headers.Authorization = token;
  return config;
});


export const getOccultations = ({ page, pageSize, sortField, filters }) => {
  const params = { page, pageSize };

  if (filters) {
    filters.forEach((element) => {
      params[element.property] = element.value;
    });
  }

  return axios.get(`/occultation/`, {
    params,
  }).then((res) => res.data);
};

export const getOccultationById = ({ id }) => axios.get(`${this.api}/occultation/${id}/`).then((res) => res.data);
