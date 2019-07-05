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

  getPraiaRunById = ({ id }) => axios.get(`${this.api}/praia_run/${id}/`);

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

  createPraiaRun = ({ input, config }) =>
    axios.post(`${this.api}/praia_run/`, {
      input_list: input,
      configuration: config,
    });

  praiaReRun = ({ id }) =>
    axios.patch(`${this.api}/praia_run/${id}/`, {
      status: 'reexecute',
    });
}

export default PraiaApi;
