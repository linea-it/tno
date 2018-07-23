import axios from 'axios';

class SkybotApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getSkybotLists = ({ page, pageSize, search, filters }) => {
    const params = { page: page, pageSize: pageSize, search: search };

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });
    return axios.get(`${this.api}/skybotoutput/`, { params: params });
  };

  getSkybotRecord = ({ id }) => axios.get(`${this.api}/skybotoutput/${id}/`);
}

export default SkybotApi;
