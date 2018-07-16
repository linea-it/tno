import axios from 'axios';

class PointingApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }
  getPointingLists = ({ page, pageSize, search, filters }) => {
    // console.log('CHEGAMOS AQUI E O VALOR DE ARRAYFILTER É', filters);
    const params = {
      page: page,
      pageSize: pageSize,
      search: search,
      //band: filters,
    };
    // console.log('ANTES do for, este é o valor do params %o', params);

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });

    // console.log('DENTRO do for, este é o valor do params %o', params);

    return axios.get(`${this.api}/pointing/`, { params: params });
  };

  getPointingRecord = ({ id }) => axios.get(`${this.api}/pointing/${id}/`);
}

export default PointingApi;
