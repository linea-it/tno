import axios from 'axios';


export const getBspJpl = ({
  page, pageSize, search,
}) => {
  return axios.get('/bsp_jpl/', {
    params: {
      page,
      pageSize,
    }
  });
};