import { api } from './api'

export const getOrbitRuns = ({
  page,
  pageSize,
  ordering,
  search,
  filters = [],
}) => {
  const params = {
    page,
    pageSize,
    ordering,
    search,
  };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return api
    .get('/orbit_run/', {
      params,
    })
    .then((res) => res.data);
};

export const createOrbitRun = ({ input_list, proccess }) =>
  api.post('/orbit_run/', {
    input_list,
    proccess,
  });

export const orbitReRun = ({ id }) =>
  api.patch(`/orbit_run/${id}/`, {
    status: 'pending',
  });

export const getOrbitRunById = ({ id }) =>
  api.get(`/orbit_run/${id}/`).then((res) => res.data);

// dados na table do primereact
export const getRefineOrbits = (id) => api.get(`/orbit_run/${id}`);

// Time Profile
export const getOrbitRunTimeProfile = ({ id }) => {
  const params = {
    orbit_run: id,
  };
  return api
    .get('/orbit_run/get_time_profile/', {
      params,
    })
    .then((res) => res.data.data);
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
    page,
    pageSize,
    search,
    ordering,
  };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return api
    .get('/refined_asteroid/', {
      params,
    })
    .then((res) => res.data);
};

export const getAsteroidById = ({ id }) =>
  api.get(`/refined_asteroid/${id}/`).then((res) => res.data);

export const getAsteroidLog = ({ id, name, orbit_run }) => {
  let params = { name, orbit_run };
  if (id) {
    params = { asteroid_id: id };
  }
  return api
    .get('/refined_asteroid/get_log/', {
      params,
    })
    .then((res) => res.data);
};

export const getAsteroidDownloadLink = ({ id, name, orbit_run }) => {
  let params = { name, orbit_run };
  if (id) {
    params = { asteroid_id: id };
  }

  return api
    .get('/refined_asteroid/download_results/', {
      params,
    })
    .then((res) => res.data);
};

export const getAsteroidNeighbors = ({ id }) => {
  const params = { asteroid_id: id };
  return api
    .get('/refined_asteroid/get_neighbors/', {
      params,
    })
    .then((res) => res.data);
};

export const getAsteroidFiles = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return api
    .get('/refined_orbit/', {
      params,
    })
    .then((res) => res.data);
};

export const getAsteroidInputs = ({ id }) => {
  const params = {
    asteroid: id,
  };
  return api
    .get('/refined_input/', {
      params,
    })
    .then((res) => res.data);
};

export const readFile = (filepath) =>
  api
    .get(`/read_file?filepath=/archive/observations/Lempo.rwo`)
    .then((res) => res.data);

export const readOrbitalFile = (filepath) =>
  api
    .get(`/read_file?filepath=/archive/orbital_parameters/Eris.eq0`)
    .then((res) => res.data);
