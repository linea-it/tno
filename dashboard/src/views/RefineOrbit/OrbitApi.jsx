import axios from 'axios';

class OrbitApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getOrbitRuns = ({ page, pageSize, ordering, filters = [] }) => {
    const params = { page: page, pageSize: pageSize, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });

    return axios.get(`${this.api}/orbit_run/`, {
      params: params,
    });
  };

  createOrbitRun = ({ input_list, proccess }) =>
    axios.post(`${this.api}/orbit_run/`, {
      input_list: input_list,
      proccess: proccess,
    });

  orbitReRun = ({ id }) =>
    axios.patch(`${this.api}/orbit_run/${id}/`, {
      status: 'pending',
    });

  getOrbitRunById = ({ id }) => axios.patch(`${this.api}/orbit_run/${id}/`);

  // dados na table do primereact
  getRefineOrbits = id => axios.get(`${this.api}/orbit_run/${id}`);

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

    return axios.get(`${this.api}/refined_asteroid/`, {
      params: params,
    });
  };

  getAsteroidById = ({ id }) =>
    axios.patch(`${this.api}/refined_asteroid/${id}/`);

  getAsteroidLog = ({ asteroid_id, name, orbit_run }) => {
    let params = { name: name, orbit_run: orbit_run };
    if (asteroid_id) {
      params = { asteroid_id: asteroid_id };
    }

    return axios.get(`${this.api}/refined_asteroid/get_log/`, {
      params: params,
    });
  };

  getAsteroidDownloadLink = ({ asteroid_id, name, orbit_run }) => {
    let params = { name: name, orbit_run: orbit_run };
    if (asteroid_id) {
      params = { asteroid_id: asteroid_id };
    }

    return axios.get(`${this.api}/refined_asteroid/download_results/`, {
      params: params,
    });
  };

  getAsteroidFiles = ({ id }) => {
    const params = {
      asteroid: id,
    };
    return axios.get(`${this.api}/refined_orbit/`, {
      params: params,
    });
  };
}
export default OrbitApi;
