import axios from 'axios';

// TODO essa variavel ja existe no auth (api) nao precisa repetir
export const url = process.env.REACT_APP_API;

axios.defaults.baseURL = url;

axios.interceptors.request.use((config) => {
  const token = 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c';
  // const token = 'Token 846db15e26e2f529c428fbd1431bb2ae9a46d686';
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

  return axios.get('/occultation/', {
    params,
  }).then((res) => res.data);
};

export const getOccultationById = ({ id }) => axios.get(`/occultation/${id}/`).then((res) => res.data);
