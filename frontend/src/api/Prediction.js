import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';


axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 9718d50273cc9470fc99ad1d0de463815dda3544';
  config.headers.Authorization = token;
  return config;
});

export const createPredictRun = ({
  process,
  input_list,
  input_orbit,
  leap_second,
  bsp_planetary,
  catalog,
  catalog_radius,
  ephemeris_initial_date,
  ephemeris_final_date,
  ephemeris_step,

}) => axios.post('/predict_run', {
  process,
  input_list,
  input_orbit,
  leap_second,
  bsp_planetary,
  catalog,
  catalog_radius,
  ephemeris_initial_date,
  ephemeris_final_date,
  ephemeris_step,
});


export const getPrediction = () => axios.get('/orbit_run/?status=success').then((res) => res.data);

export const getCatalogs = () => axios.get('/catalog/').then((res) => res.data);

export const getLeapSeconds = () => axios.get('/leap_seconds/').then((res) => res.data);

export const getBspPlanetary = () => axios.get('/bsp_planetary/').then((res) => res.data);

export const getPredictionRuns = ({
  page, pageSize, ordering, filters = [],
}) => {
  const params = { page, pageSize, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/predict_run/', {
    params,
  }).then((res) => res.data);
};

export const predictReRun = ({ id }) => axios.patch(`/predict_run/${id}/`, {
  status: 'pending',
});

export const getPredictionRunById = ({ id }) => axios.patch(`/predict_run/${id}/`).then((res) => res.data);

export const getTimeProfile = ({ id }) => {
  const params = {
    id,
  };
  return axios.get('/predict_run/get_time_profile/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroids = ({
  page,
  sizePerPage,
  sortField,
  sortOrder,
  filters = [],
}) => {
  let ordering = sortField;
  if (sortOrder === -1) {
    ordering = `-${sortField}`;
  }

  const params = { page, pageSize: sizePerPage, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/predict_asteroid/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidById = ({ id }) => axios.get(`/predict_asteroid/${id}/`).then((res) => res.data);

export const getAsteroidNeighbors = ({ id }) => {
  const params = { asteroid: id };
  return axios.get('/predict_asteroid/get_neighbors/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidDownloadLink = ({ asteroid_id, name, orbit_run }) => {
  let params = { name, orbit_run };
  if (asteroid_id) {
    params = { asteroid_id };
  }

  return axios.get('/predict_asteroid/download_results/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidInputs = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/predict_input/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidOutputs = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/predict_output/', {
    params,
  }).then((res) => res.data);
};

export const getOccultations = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/occultation/', {
    params,
  }).then((res) => res.data);
};

export const getCatalogPositions = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/predict_asteroid/catalog_positions', {
    params,
  }).then((res) => res.data);
};

export const getCatalogStars = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/predict_asteroid/catalog_stars', {
    params,
  }).then((res) => res.data);
};


// getPredictionEvent = ({ asteroidId }) => {
//   return axios.get(`/occultation/?asteroid=${asteroidId}`);
// };

export const getPredictionEvent = ({ asteroidId }) => axios.get(`http://tno-testing.linea.gov.br/api/occultation/?asteroid=${asteroidId}`).then((res) => res.data);
