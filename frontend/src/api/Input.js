import axios from 'axios';


export const getBspJpl = ({
  page, pageSize,
}) => {
  return axios.get('/bsp_jpl/', {
    params: {
      page,
      pageSize,
    }
  });
};


export const getObservationFiles = ({
  page, pageSize
})=>{
  
  return axios.get('observation_files',{
    params:{
      page,
      pageSize,
    }
  });

};