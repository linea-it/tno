import axios from 'axios';

class PredictionApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  createPredictRun = ({
    process,
    input_list,
    input_orbit,
    leap_second,
    bsp_planetary,
    catalog,
    catalog_radius,
    ephemeris_initial_date,
    ephemeris_final_date,
    ephemeris_step,
  }) =>
    axios.post(`${this.api}/predict_run/`, {
      process: process,
      input_list: input_list,
      input_orbit: input_orbit,
      leap_second: leap_second,
      bsp_planetary: bsp_planetary,
      catalog: catalog,
      catalog_radius: catalog_radius,
      ephemeris_initial_date: ephemeris_initial_date,
      ephemeris_final_date: ephemeris_final_date,
      ephemeris_step: ephemeris_step,
    });

  getPrediction = () => {
    return axios.get(`http://localhost:7001/orbit_run/?status=success`);
  };

  getCatalogs = () => {
    return axios.get(`http://localhost:7001/catalog/`);
  };

  getLeapSeconds = () => {
    return axios.get(`http://localhost:7001/leap_seconds/`);
  };

  getBspPlanetary = () => {
    return axios.get(`http://localhost:7001/bsp_planetary/`);
  };

  getPredictionRuns = ({ page, pageSize, ordering, filters = [] }) => {
    const params = { page: page, pageSize: pageSize, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });

    return axios.get(`${this.api}/predict_run/`, {
      params: params,
    });
  };

  predictReRun = ({ id }) =>
    axios.patch(`${this.api}/predict_run/${id}/`, {
      status: 'pending',
    });

  getPredictionRunById = ({ id }) =>
    axios.patch(`${this.api}/predict_run/${id}/`);

  // createOrbitRun = ({ input_list, proccess }) =>
  //   axios.post(`${this.api}/orbit_run/`, {
  //     input_list: input_list,
  //     proccess: proccess,
  //   });

  // orbitReRun = ({ id }) =>
  //   axios.patch(`${this.api}/orbit_run/${id}/`, {
  //     status: 'pending',
  //   });

  getAsteroids = ({
    page,
    sizePerPage,
    sortField,
    sortOrder,
    filters = [],
  }) => {
    let ordering = sortField;
    if (sortOrder === -1) {
      ordering = '-' + sortField;
    }

    const params = { page: page, pageSize: sizePerPage, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });

    return axios.get(`${this.api}/refined_asteroid/`, {
      params: params,
    });
  };
}

export default PredictionApi;
