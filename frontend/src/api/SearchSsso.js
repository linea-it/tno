
import axios from 'axios';

export const getSkybotLists = ({
  page, pageSize, search, filters,
}) => {
  const params = { page, pageSize, search };


  filters.forEach((el) => {
    params[el.property] = el.value;
  });

  return axios.get('/skybotoutput/', { params });
};

export const getSkybotOutput = ({
  page = 1,
  pageSize,
  name,
  objectTable,
  useMagnitude,
  magnitude,
  useDifferenceTime,
  diffDateNights,
  moreFilter,
  checked,
  filters = [],
}) => {
  const params = {
    page,
    pageSize,
    name,
    objectTable,
    useMagnitude,
    magnitude,
    useDifferenceTime,
    diffDateNights,
    moreFilter,
    checked,
  };

  filters.forEach((element) => {
    if (element.value && element.value !== null) {
      params[element.property] = element.value;
    }
  });

  return axios.get('/skybotoutput/objects', {
    params,
  }).then((res) => res.data);
};
export const getSkybotRecord = ({ id }) => axios.get(`/skybotoutput/${id}/`);
