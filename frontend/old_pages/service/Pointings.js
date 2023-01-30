import { api } from './api'

export const getPointingsList = ({ page, pageSize, search, filters }) => {
  const params = {
    page,
    pageSize,
    search,
  };

  filters.forEach((el) => {
    params[el.property] = el.value;
  });

  return api.get('/pointing/', { params }).then((res) => res.data);
};

export const getPointing = ({ id }) =>
  api.get(`/pointing/${id}`).then((res) => res.data);
