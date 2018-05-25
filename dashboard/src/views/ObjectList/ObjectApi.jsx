import axios from 'axios';

class ObjectApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getList = ({ id }) => axios.get(`${this.api}/customlist/${id}/`);

  listObjects = ({ tablename, page, pageSize }) =>
    axios.get(`${this.api}/customlist/list_objects/`, {
      params: { tablename: tablename, page: page, pageSize: pageSize },
    });
}

export default ObjectApi;
