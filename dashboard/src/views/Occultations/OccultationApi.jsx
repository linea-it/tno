import axios from 'axios';

class OccultationApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  getOccultations = (page, pageSize, sortField, sortOrder) => {
    const params = { page: page, pageSize: pageSize, ordering: sortField };

    // let ordering = sortField;
    // // if (sortOrder === -1) {
    // //   ordering = '-' + sortField;
    // // }
    // params.ordering = ordering;

    return axios.get(`${this.api}/occultation/`, {
      params: params,
    });
  };

  getOccultationById = ({ id }) =>
    axios.patch(`${this.api}/occultation/${id}/`);
}

export default OccultationApi;
