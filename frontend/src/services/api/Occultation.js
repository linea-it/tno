import axios from 'axios';

export const getOccultations = ({ page, pageSize, sortField, filters }) => {
  const params = { page, pageSize };

  if (filters) {
    filters.forEach((element) => {
      params[element.property] = element.value;
    });
  }

  return axios
    .get('/occultation/', {
      params,
    })
    .then((res) => res.data);
};

export const getOccultationById = ({ id }) =>
  axios.get(`/occultation/${id}/`).then((res) => res.data);
