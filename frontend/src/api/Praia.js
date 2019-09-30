import axios from 'axios';

const url = 'http://tno-testing.linea.gov.br/api';
axios.defaults.baseURL = url;


export const getListsByStatus = ({ status, search }) =>
  axios.get(`customlist/`, {
    params: { status: status, search: search },
  });



export const getPraiaRuns = ({
  page, pageSize, ordering, filters = [],
}) => {
  const params = { page, pageSize, ordering };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('praia_run/', {
    params,
  }).then((res) => res.data);
};

export const getConfigurations = ({
  page, pageSize, search, ordering,
}) => axios.get('praia_configuration/', {
  params: {
    page,
    pageSize,
    search,
    ordering,
  },
});

export const getCatalogs = ({ search }) => axios.get('catalog/', {
  params: {
    search,
  },
});

export const getCatalogById = ({ id }) => axios.get('catalog/', {
  params: {
    id,
  },
});

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

  return axios.get('astrometry_asteroids/', {
    params,
  });
};

export const getPraiaRunById = ({ id }) => axios.get(`praia_run/${id}/`);

export const getExecutionTimeById = ({ id }) => axios.get(`praia_run/${id}/step_execution_time/`);

// dados na table do primereacts
export const getPraiaData = (id) => axios.get(`praia_run/${id}`);

// Time Profile
export const getPraiaRunTimeProfile = ({ id }) => {
  const params = {
    orbit_run: id,
  };
  return axios.get('praia_run/get_time_profile/', {
    params,
  });
};

export const createPraiaRun = ({ input, config, catalog }) => axios.post('praia_run/', {
  input_list: input,
  configuration: config,
  catalog,
});

export const praiaReRun = ({ id }) => axios.patch(`praia_run/${id}/`, {
  status: 'reexecute',
});

export const getAsteroidById = async (id) => await axios.get(`astrometry_asteroids/${id}`);

export const getInputsByAsteroidId = ({ id }) => axios.get('astrometry_input/', {
  params: {
    asteroid: id,
  },
});

export const getAsteroidStatus = ({ id }) => axios.get(`praia_run/${id}/count_asteroid_status/`);

export const checkJobStatus = () => axios.get('teste/');

export const getCSV = (filepath, page, pageSize) => axios.get(
  `${
  this.api
  }/read_csv?filepath=${filepath}&page=${page}&pageSize=${pageSize}`,
);

export const readOutputFile = (filepath) => {
  const replaced_filepath = filepath.replace('/data', '');

  return axios.get(`read_file?filepath=${replaced_filepath}`);
};

export const readCondorFile = (filepath) => axios.get(`read_file?filepath=${filepath}`);
