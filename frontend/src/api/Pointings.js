import axios from 'axios';

// TODO essa variavel ja existe no auth (api) nao precisa repetir
export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 2c68c902fd81d383aca48ff17b92435f890a130d';
  config.headers.Authorization = token;
  return config;
});


export const getPointingsList = ({
  page, pageSize, search, filters,
}) => {
  const params = {
    page,
    pageSize,
    search,
  };

  filters.forEach((el) => {
    params[el.property] = el.value;
  });

  return axios.get('/pointing/', { params }).then((res) => res.data);
};

export const getPointing = ({ id }) => axios.get(`/pointing/${id}`).then((res) => res.data);
