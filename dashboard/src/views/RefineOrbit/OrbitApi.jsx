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

  // dados na table do primereact
  getRefineOrbits = id => axios.get(`${this.api}/orbit_run/${id}`);

  getLogRefineOrbits = () => axios.get(`${this.api}/orbit_run/log_by_objects/`);

  getDataLog = ({ cod, name }) => {
    const params = { name: name, cod: cod };

    return axios.get(`${this.api}/orbit_run/log_by_objects/`, {
      params: params,
    });
  };
}
export default OrbitApi;
