import axios from 'axios';
import moment from 'moment';

class SkybotApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getSkybotRunList = ({ page, pageSize, sortField, sortOrder }) => {

    let ordering = sortField;
    if (sortOrder === -1) {
      ordering = '-' + sortField;
    }

    const params = {
      page: page,
      pageSize: pageSize,
      ordering: ordering,
    };

    return axios.get(`${this.api}/skybot_run/`, { params: params });
  };

  getSkybotRunById = ({ id }) => {
    return axios.get(`${this.api}/skybot_run/${id}`);
  };

  getTimeProfile = ({ id }) => {
    return axios.get(`${this.api}/skybot_run/time_profile/`, {
      params: { run_id: id },
    });
  };

  getSkybotRunResults = ({ skybotrun, page, sizePerPage }) => {
    const params = { run_id: skybotrun, page: page, pageSize: sizePerPage };
    return axios.get(`${this.api}/skybot_run/results/`, { params: params });
  };

  getSkybotResultByExposure = (skybotrun, expnum) => {
    return axios.get(`${this.api}/skybot_run/skybot_output_by_exposure/`, {
      params: { run_id: skybotrun, expnum: expnum },
    });
  };

  getExposurePlot = (skybotrun, expnum) => {
    return axios.get(`${this.api}/skybot_run/skybot_output_plot/`, {
      params: { run_id: skybotrun, expnum: expnum },
    });
  };
  getAsteroidsInsideCCD = expnum => {
    return axios.get(`${this.api}/skybot_run/asteroids_ccd/`, {
      params: { expnum: expnum },
    });
  };

  getStatistic = ({ id }) => {
    return axios.get(`${this.api}/skybot_run/statistic/`, {
      params: { run_id: id },
    });
  };

  createSkybotRun = ({
    type_run,
    date_initial,
    date_final,
    ra_cent,
    dec_cent,
    radius,
    ra_ur,
    ra_ul,
    ra_lr,
    ra_ll,
  }) => {
    date_initial = date_initial !== '' ? moment(date_initial).format('YYYY-MM-DD') : null;
    date_final = date_final !== '' ? moment(date_final).format('YYYY-MM-DD') : null;

    return axios.post(`${this.api}/skybot_run/`, {
      type_run: type_run,
      status: 'pending',
      date_initial: date_initial,
      date_final: date_final,
      radius: radius,
      ra_cent: ra_cent,
      dec_cent: dec_cent,
      ra_ur: ra_ur,
      ra_ul: ra_ul,
      ra_lr: ra_lr,
      ra_ll: ra_ll,
    });
  };

  rerunSkybot = id => {
    return axios.patch(`${this.api}/skybot_run/${id}/`, {
      start: null,
      final: null,
      status: 'pending',
      exposure: null,
      rows: null,
    });
  };

  cancelSkybotRun = id => {
    return axios.patch(`${this.api}/skybot_run/${id}/`, {
      status: 'canceled',
    });
  };

  getSkybotLists = ({ page, pageSize, search, filters }) => {
    const params = { page: page, pageSize: pageSize, search: search };

    filters.forEach(function (el) {
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
