import axios from 'axios';

class PointingApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }
  getPointingLists = ({ page, pageSize, search, filters }) => {
    const params = {
      page: page,
      pageSize: pageSize,
      search: search,
    };

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });
    //console.log(params);
    return axios.get(`${this.api}/pointing/`, { params: params });
  };

  getPointingRecord = ({ id }) => axios.get(`${this.api}/pointing/${id}/`);

  getPointingCount = () => axios.get(`${this.api}/pointing/`);
  // getPointingBandU = () => axios.get(`${this.api}/pointing/band_in=u`);

}

export default PointingApi;
