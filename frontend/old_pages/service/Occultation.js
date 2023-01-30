import { api } from './api'

export const getOccultations = ({ page, pageSize, sortField, filters }) => {
  const params = { page, pageSize };

  if (filters) {
    filters.forEach((element) => {
      params[element.property] = element.value;
    });
  }

  return api
    .get('/occultation/', {
      params,
    })
    .then((res) => res.data);
};

export const getOccultationById = ({ id }) =>
  api.get(`/occultation/${id}/`).then((res) => res.data);
