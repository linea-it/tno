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
}

export default SkybotApi;
