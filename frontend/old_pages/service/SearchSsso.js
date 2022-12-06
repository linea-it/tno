import { api } from './api'

export const getSkybotLists = ({ page, pageSize, search, filters }) => {
  const params = { page, pageSize, search };

  filters.forEach((el) => {
    params[el.property] = el.value;
  });

  return api.get('/skybotoutput/', { params });
};

export const getSkybotRecord = ({ id }) => api.get(`/skybotoutput/${id}/`);
