import axios from 'axios';

class ObjectApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getList = ({ id }) => axios.get(`${this.api}/customlist/${id}/`);
}

export default ObjectApi;
