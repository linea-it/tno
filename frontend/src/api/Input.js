import axios from 'axios';


export const getBspJpl = ({
  page, pageSize, search
}) => {
  return axios.get('/bsp_jpl/', {
    params: {
      page,
      pageSize,
      search,
    }
  });
};

export const getObservationFiles = ({
  page, pageSize, search
}) => {

  return axios.get('observation_files', {
    params: {
      page,
      pageSize,
      search,
    }
  });

};