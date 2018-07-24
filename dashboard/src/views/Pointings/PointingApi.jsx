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
    };

    filters.forEach(function(el) {
      params[el.property] = el.value;
    });

    return axios.get(`${this.api}/pointing/`, { params: params });
  };

  getPointingRecord = ({ id }) => axios.get(`${this.api}/pointing/${id}/`);

  getPointingCount = () => axios.get(`${this.api}/pointing/`);

  // gets in band
  getPointingBand_u = () => axios.get(`${this.api}/pointing/?band__in=u`);
  getPointingBand_y = () => axios.get(`${this.api}/pointing/?band__in=Y`);
  getPointingBand_g = () => axios.get(`${this.api}/pointing/?band__in=g`);
  getPointingBand_r = () => axios.get(`${this.api}/pointing/?band__in=r`);
  getPointingBand_i = () => axios.get(`${this.api}/pointing/?band__in=i`);
  getPointingBand_z = () => axios.get(`${this.api}/pointing/?band__in=z`);
  // gets in interval of exposure time
  getPointingBetween1 = () =>
    axios.get(`${this.api}/pointing/?exptime__range=0,100`);
  getPointingBetween2 = () =>
    axios.get(`${this.api}/pointing/?exptime__range=100,200`);
  getPointingBetween3 = () =>
    axios.get(`${this.api}/pointing/?exptime__range=200,300`);
  getPointingBetween4 = () =>
    axios.get(`${this.api}/pointing/?exptime__range=300,400`);
  // gets in downloaded or not downloaded
  getPointingDowloaded = () =>
    axios.get(`${this.api}/pointing/?downloaded=true`);
  getPointingNotDowloaded = () =>
    axios.get(`${this.api}/pointing/?downloaded=false`);
  getPointingDataRecent = () =>
    axios.get(`${this.api}/pointing`, {
      params: {
        ordering: '-date_obs',
        pageSize:1
      },
    });

}

export default PointingApi;
