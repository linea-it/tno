import axios from 'axios';

class PraiaApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getPraiaRuns = ({ page, pageSize, ordering, filters = [] }) => {
    const params = { page: page, pageSize: pageSize, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });

    return axios.get(`${this.api}/praia_run/`, {
      params: params,
    });
  };

  getConfigurations = ({ page, pageSize, search, ordering }) =>
    axios.get(`${this.api}/praia_configuration/`, {
      params: {
        page: page,
        pageSize: pageSize,
        search: search,
        ordering: ordering,
      },
    });

  getCatalogs = ({ search }) =>
    axios.get(`${this.api}/catalog/`, {
      params: {
        search: search,
      },
    });

  getCatalogById = ({ id }) =>
    axios.get(`${this.api}/catalog/`, {
      params: {
        id: id,
      },
    });

  getAsteroids = ({
    page,
    sizePerPage,
    sortField,
    sortOrder,
    filters = [],
  }) => {
    let ordering = sortField;
    if (sortOrder === -1) {
      ordering = '-' + sortField;
    }

    const params = { page: page, pageSize: sizePerPage, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });

    return axios.get(`${this.api}/astrometry_asteroids/`, {
      params: params,
    });
  };

  getPraiaRunById = ({ id }) => axios.get(`${this.api}/praia_run/${id}/`);

  getExecutionTimeById = ({ id }) => {
    return axios.get(`${this.api}/praia_run/${id}/step_execution_time/`);
  };

  // dados na table do primereacts
  getPraiaData = id => axios.get(`${this.api}/praia_run/${id}`);

  // Time Profile
  getPraiaRunTimeProfile = ({ id }) => {
    const params = {
      orbit_run: id,
    };
    return axios.get(`${this.api}/praia_run/get_time_profile/`, {
      params: params,
    });
  };

  createPraiaRun = ({ input, config, catalog }) =>
    axios.post(`${this.api}/praia_run/`, {
      input_list: input,
      configuration: config,
      catalog: catalog,
    });

  praiaReRun = ({ id }) =>
    axios.patch(`${this.api}/praia_run/${id}/`, {
      status: 'reexecute',
    });

  getAsteroidById = async id =>
    await axios.get(`${this.api}/astrometry_asteroids/${id}`);

  getInputsByAsteroidId = ({ id }) =>
    axios.get(`${this.api}/astrometry_input/`, {
      params: {
        asteroid: id,
      },
    });

  getAsteroidStatus = ({ id }) =>
    axios.get(`${this.api}/praia_run/${id}/count_asteroid_status/`);

  checkJobStatus = () => axios.get(`${this.api}/teste/`);

  read_astrometry_table = id =>
    axios.get(`${this.api}/astrometry_asteroids/${id}/astrometry_table/`);

  getAsteroidOutputsByCCds = id =>
    axios.get(`${this.api}/astrometry_asteroids/${id}/outputs_by_ccd/`);

  getAsteroidOutputsTree = id =>
    axios.get(
      `${this.api}/astrometry_asteroids/${id}/outputs_by_ccd/?tree=true`
    );

  getCSV = (filepath, page, pageSize) => {
    return axios.get(
      `${
      this.api
      }/read_csv?filepath=${filepath}&page=${page}&pageSize=${pageSize}`
    );
  };

  readOutputFile = filepath => {
    const replaced_filepath = filepath.replace('/data', '');

    return axios.get(`${this.api}/read_file?filepath=${replaced_filepath}`);
  };

  readCondorFile = filepath => {
    return axios.get(`${this.api}/read_file?filepath=${filepath}`);
  };
}

export default PraiaApi;
