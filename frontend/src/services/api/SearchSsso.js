import axios from 'axios';

export const getSkybotLists = ({ page, pageSize, search, filters }) => {
  const params = { page, pageSize, search };

  filters.forEach((el) => {
    params[el.property] = el.value;
  });

  return axios.get('/skybotoutput/', { params });
};

export const getSkybotRecord = ({ id }) => axios.get(`/skybotoutput/${id}/`);
