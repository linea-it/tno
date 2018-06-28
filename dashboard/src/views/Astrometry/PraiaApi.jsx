import axios from 'axios';

class PraiaApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getPraiaRuns = ({ page, pageSize }) =>
    axios.get(`${this.api}/praia_run/`, {
      params: { page: page, pageSize: pageSize },
    });

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
