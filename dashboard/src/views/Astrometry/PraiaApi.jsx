import axios from 'axios';

class PraiaApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getPraiaRuns = ({ page, pageSize }) =>
    axios.get(`${this.api}/praia_run/`, {
      params: { page: page, pageSize: pageSize },
    });
}

export default PraiaApi;
