import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';


axios.defaults.baseURL = url;
axios.interceptors.request.use((config) => {
  const token = 'Token 9718d50273cc9470fc99ad1d0de463815dda3544';
  config.headers.Authorization = token;
  return config;
});


export const getOrbitRuns = ({
  page, pageSize, ordering, search, filters = [],
}) => {
  const params = {
    page, pageSize, ordering, search,
  };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/orbit_run/', {
    params,
  }).then((res) => res.data);
};

export const createOrbitRun = ({ input_list, proccess }) => axios.post('/orbit_run/', {
  input_list,
  proccess,
});

export const orbitReRun = ({ id }) => axios.patch(`/orbit_run/${id}/`, {
  status: 'pending',
});

export const getOrbitRunById = ({ id }) => axios.get(`/orbit_run/${id}/`).then((res) => res.data);

// dados na table do primereact
export const getRefineOrbits = (id) => axios.get(`/orbit_run/${id}`);

// Time Profile
export const getOrbitRunTimeProfile = ({ id }) => {
  const params = {
    orbit_run: id,
  };
  return axios.get('/orbit_run/get_time_profile/', {
    params,
  }).then((res) => res.data.data);
};

export const getAsteroids = ({
  page,
  pageSize,
  sortField,
  sortOrder,
  search,
  filters = [],
}) => {
  let ordering = sortField;
  if (sortOrder === -1) {
    ordering = `-${sortField}`;
  }

  const params = {
    page, pageSize, search, ordering,
  };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/refined_asteroid/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidById = ({ id }) => axios.get(`/refined_asteroid/${id}/`).then((res) => res.data);

export const getAsteroidLog = ({ asteroid_id, name, orbit_run }) => {
  let params = { name, orbit_run };
  if (asteroid_id) {
    params = { asteroid_id };
  }

  return axios.get('/refined_asteroid/get_log/', {
    params,
  });
};

export const getAsteroidDownloadLink = ({ asteroid_id, name, orbit_run }) => {
  let params = { name, orbit_run };
  if (asteroid_id) {
    params = { asteroid_id };
  }

  return axios.get('/refined_asteroid/download_results/', {
    params,
  });
};

export const getAsteroidNeighbors = ({ id }) => {
  const params = { asteroid_id: id };
  return axios.get('/refined_asteroid/get_neighbors/', {
    params,
  }).then((res) => res.data);
};

export const getAsteroidFiles = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/refined_orbit/', {
    params,
  }).then((res) => {
    console.log(res.data.results);
    return res.data;
  });
};

export const getAsteroidInputs = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return axios.get('/refined_input/', {
    params,
  }).then((res) => res.data);
};