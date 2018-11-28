import axios from 'axios';

class OccultationApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getOccultations = ({ page, pageSize, ordering, filters = [] }) => {
    const params = { page: page, pageSize: pageSize, ordering: ordering };
    filters.forEach(element => {
      params[element.property] = element.value;
    });
    return axios.get(`${this.api}/occultation/`, {
      params: params,
    });
  };
}

export default OccultationApi;
