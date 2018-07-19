import axios from 'axios';

class SkybotApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getSkybotLists = ({ page, pageSize, search }) =>
    axios.get(`${this.api}/skybotoutput/`, {
      params: { page: page, pageSize: pageSize, search: search },
    });

  getSkybotRecord = ({ id }) => axios.get(`${this.api}/skybotoutput/${id}/`);
  getPointingBand_u = () => axios.get(`${this.api}/pointing/?band__in=u`);
  getPointingBand_y = () => axios.get(`${this.api}/pointing/?band__in=Y`);
  getPointingBand_g = () => axios.get(`${this.api}/pointing/?band__in=g`);
  getPointingBand_r = () => axios.get(`${this.api}/pointing/?band__in=r`);
  getPointingBand_i = () => axios.get(`${this.api}/pointing/?band__in=i`);
  getPointingBand_z = () => axios.get(`${this.api}/pointing/?band__in=z`);
}

export default SkybotApi;
