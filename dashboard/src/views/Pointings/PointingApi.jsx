import axios from 'axios';

class PointingApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getPointingLists = ({ page, pageSize, search, filter }) =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        page: page,
        pageSize: pageSize,
        search: search,
        band: filter,
      },
    });

  getPointingRecord = ({ id }) => axios.get(`${this.api}/pointing/${id}/`);
}

export default PointingApi;
