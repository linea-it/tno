import axios from 'axios';

export const getPraiaRuns = ({ page, pageSize, ordering, filters = [] }) => {
  const params = { page, pageSize, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios
    .get('/praia_run/', {
      params,
    })
    .then((res) => res.data);
};
