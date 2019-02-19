import axios from 'axios';

class SkybotApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getSkybotRunList = ({ page, pageSize, search }) => {
    const params = { page: page, pageSize: pageSize, search: search };

    return axios.get(`${this.api}/skybot_run/`, { params: params });
  };

  createSkybotRun = ({
    start,
    final,
    status,
    exposure,
    date_initial,
    date_final,
    type_run,
    ra_cent,
    dec_cent,
    radius,
    ra_ur,
    ra_ul,
    ra_lr,
    ra_ll,
  }) =>
    axios.post(`${this.api}/skybot_run/`, {
      start: start,
      final: final,
      status: status,
      exposure: exposure,
      date_initial: date_initial,
      date_final: date_final,
      type_run: type_run,
      radius: radius,
      ra_cent: ra_cent,
      dec_cent: dec_cent,
      ra_ur: ra_ur,
      ra_ul: ra_ul,
      ra_lr: ra_lr,
      ra_ll: ra_ll,
    });

  getSkybotLists = ({ page, pageSize, search, filters }) => {
    const params = { page: page, pageSize: pageSize, search: search };

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });
    return axios.get(`${this.api}/skybotoutput/`, { params: params });
  };

  getSkybotRecord = ({ id }) => axios.get(`${this.api}/skybotoutput/${id}/`);
  getPointingBand_u = () => axios.get(`${this.api}/pointing/?band__in=u`);
  getPointingBand_y = () => axios.get(`${this.api}/pointing/?band__in=Y`);
  getPointingBand_g = () => axios.get(`${this.api}/pointing/?band__in=g`);
  getPointingBand_r = () => axios.get(`${this.api}/pointing/?band__in=r`);
  getPointingBand_i = () => axios.get(`${this.api}/pointing/?band__in=i`);
  getPointingBand_z = () => axios.get(`${this.api}/pointing/?band__in=z`);
}

export default SkybotApi;
