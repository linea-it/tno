import { api } from './api'

export const getPraiaRuns = ({ page, pageSize, ordering, filters = [] }) => {
  const params = { page, pageSize, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return api
    .get('/praia_run/', {
      params,
    })
    .then((res) => res.data);
};
