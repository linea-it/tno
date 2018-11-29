import axios from 'axios';

class OccultationApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getOccultations = (page, pageSize) => {
    const params = { page: page, pageSize: pageSize };

    return axios.get(`${this.api}/occultation/`, {
      params: params,
    });
  };

  getOccultationById = ({ id }) =>
    axios.patch(`${this.api}/occultation/${id}/`);
}

export default OccultationApi;
