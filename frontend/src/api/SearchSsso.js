
import axios from 'axios';

// export const url = 'http://tno-testing.linea.gov.br/api';

export const url = 'http://localhost/api';
axios.defaults.baseURL = url;
axios.defaults.headers.common['Authorization'] = 'Token 50016f67aed3cad432ac10c5e7a16a0745626d1c';



export const getSkybotLists = ({ page, pageSize, search, filters }) => {
  const params = { page: page, pageSize: pageSize, search: search };


  filters.forEach(function (el) {
    params[el.property] = el.value;

  });

  console.log(params);
  return axios.get(`/skybotoutput/`, { params: params });
}


export const getAsteroids = ({
  page,
  sizePerPage,
  sortField,
  sortOrder,
  filters = [],
}) => {
  let ordering = sortField;
  if (sortOrder === -1) {
    ordering = `-${sortField}`;
  }

  const params = { page, pageSize: sizePerPage, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/astrometry_asteroids/', {
    params,
  }).then((res) => res.data);
};