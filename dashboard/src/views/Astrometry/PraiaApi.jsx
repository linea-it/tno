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

  createPraiaRun = ({ input, config }) =>
    axios.post(`${this.api}/praia_run/`, {
      input_list: input,
      configuration: config,
    });
}

export default PraiaApi;
