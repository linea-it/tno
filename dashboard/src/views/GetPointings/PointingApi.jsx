import axios from 'axios';

class PointingApi{
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getPointingLists = ({ page, pageSize }) =>
    axios.get(`${this.api}/pointing/`, {
      params: { page: page, pageSize: pageSize },
    });

}

export default PointingApi;
