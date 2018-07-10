import axios from 'axios';

class PointingApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }
  getPointingLists = ({ page, pageSize, search, filters }) => {
    const params = {
      page: page,
      pageSize: pageSize,
      search: search,
      //band: filters,
    };
    console.log('ANTES do for, este é o valor do params %o', params);

    // let filter = {};
    console.log('filters: ', filters);

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });

    // for (filter in filters) {
    //   params[filter.propery] = filter.value;
    //   console.log('DENTRO do for, este é o valor do params %o', params);
    // }
    
    // console.log('DEPOIS do for, este é o valor do params %o', params);


    // foreach(filters in filter) {
    // params[filter.propery] = filter.value;

    // }
    return axios.get(`${this.api}/pointing/`, params);
  };

  getPointingRecord = ({ id }) => axios.get(`${this.api}/pointing/${id}/`);
}

export default PointingApi;
