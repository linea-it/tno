import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';

axios.defaults.baseURL = url;


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
