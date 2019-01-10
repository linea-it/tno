import axios from 'axios';

class DashboardApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getExposuresInfo = () => {
    return axios.get(`${this.api}/pointing/statistics/`);
  };

  getHistogramExposure = () => {
    return axios.get(`${this.api}/pointing/histogram_exposure/`);
  };

  getSkybotInfo = () => {
    return axios.get(`${this.api}/skybotoutput/statistics/`);
  };
}
export default DashboardApi;
