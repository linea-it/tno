import axios from 'axios';

class DashboardApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getExposuresInfo = () => {
    return axios.get(`${this.api}/pointing/generate_statistics/`);
  };
}
export default DashboardApi;
