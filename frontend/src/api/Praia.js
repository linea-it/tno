import axios from 'axios';

export const url = 'http://tno-testing.linea.gov.br/api';
axios.defaults.baseURL = url;

export const getListsByStatus = ({ status, search }) => axios.get('customlist/', {
  params: { status, search },
}).then((res) => res.data);

export const getPraiaRuns = ({
  page, pageSize, ordering, filters = [],
}) => {
  const params = { page, pageSize, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/praia_run/', {
    params,
  }).then((res) => res.data);
};

export const getConfigurations = ({
  page, pageSize, search, ordering,
}) => axios.get('/praia_configuration/', {
  params: {
    page,
    pageSize,
    search,
    ordering,
  },
}).then((res) => res.data);

export const getCatalogs = ({ search }) => axios.get('/catalog/', {
  params: {
    search,
  },
}).then((res) => res.data);

export const getCatalogById = ({ id }) => axios.get('/catalog/', {
  params: {
    id,
  },
}).then((res) => res.data);

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

  return axios.get('/astrometry_asteroids/', {
    params,
  }).then((res) => res.data);
};

export const getPraiaRunById = ({ id }) => axios.get(`/praia_run/${id}/`).then((res) => res.data);

export const getExecutionTimeById = ({ id }) => axios.get(`/praia_run/${id}/step_execution_time/`).then((res) => res.data);

// dados na table do primereacts
export const getPraiaData = (id) => axios.get(`/praia_run/${id}`).then((res) => res.data);

// Time Profile
export const getPraiaRunTimeProfile = ({ id }) => {
  const params = {
    orbit_run: id,
  };
  return axios.get('/praia_run/get_time_profile/', {
    params,
  }).then((res) => res.data);
};

export const createPraiaRun = ({ input, config, catalog }) => axios.post('/praia_run/', {
  input_list: input,
  configuration: config,
  catalog,
});

export const praiaReRun = ({ id }) => axios.patch(`/praia_run/${id}/`, {
  status: 'reexecute',
});

export const getAsteroidById = ({ id }) => axios.get(`/astrometry_asteroids/${id}`).then((res) => res.data);

export const getInputsByAsteroidId = ({ id }) => axios.get('/astrometry_input/', {
  params: {
    asteroid: id,
  },
}).then((res) => res.data);

export const getAsteroidNeighbors = ({ id }) => axios.get(`/astrometry_asteroids/${id}/get_neighbors/`).then((res) => res.data);

export const getAsteroidStatus = ({ id }) => axios.get(`/praia_run/${id}/count_asteroid_status/`).then((res) => res.data);

export const getAstrometryTable = ({ id }) => axios.get(`/astrometry_asteroids/${id}/astrometry_table/`).then((res) => res.data);

export const getAsteroidMainOutputs = ({ id }) => axios.get(`/astrometry_asteroids/${id}/main_outputs/`).then((res) => res.data);

export const getAsteroidOutputsByCCds = ({ id }) => axios.get(`/astrometry_asteroids/${id}/outputs_by_ccd/`).then((res) => res.data);

export const getAsteroidOutputsTree = ({ id }) => axios.get(
  `/astrometry_asteroids/${id}/outputs_by_ccd/?tree=true`,
).then((res) => res.data);

export const getAstrometryPlots = ({ id }) => axios.get(`/astrometry_asteroids/${id}/plot_ccd/`).then((res) => res.data);

export const getCSV = (filepath, page, pageSize) => axios.get(
  `${
    this.api
  }/read_csv?filepath=${filepath}&page=${page}&pageSize=${pageSize}`,
);

export const getOutputFile = (filepath) => {
  const replaced_filepath = filepath.replace('/data', '');

  return axios.get(`/read_file?filepath=${replaced_filepath}`).then((res) => res.data);
};

export const readCondorFile = (filepath) => axios.get(`/read_file?filepath=${filepath}`);
