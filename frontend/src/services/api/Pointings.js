import axios from 'axios';

export const getPointingsList = ({ page, pageSize, search, filters }) => {
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

export const getPointing = ({ id }) =>
  axios.get(`/pointing/${id}`).then((res) => res.data);
