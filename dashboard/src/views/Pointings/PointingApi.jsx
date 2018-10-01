import axios from 'axios';
class PointingApi {
  constructor() {
    this.api = process.env.REACT_APP_API;
  }

  band = {
    g: 'g',
    r: 'r',
    y: 'Y',
    z: 'z',
    i: 'i',
    u: 'u',
  };

  exptime = {
    range1: '0,100',
    range2: '100,200',
    range3: '200,300',
    range4: '300,400',
  };

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

  getPointingBand_g = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.g,
      },
    });
  getPointingBand_r = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.r,
      },
    });
  getPointingBand_y = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.y,
      },
    });
  getPointingBand_z = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.z,
      },
    });
  getPointingBand_i = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.i,
      },
    });
  getPointingBand_u = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        band__in: this.band.u,
      },
    });

  getPointingBetween1 = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        exptime__range: this.exptime.range1,
      },
    });
  getPointingBetween2 = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        exptime__range: this.exptime.range2,
      },
    });
  getPointingBetween3 = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        exptime__range: this.exptime.range3,
      },
    });
  getPointingBetween4 = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        exptime__range: this.exptime.range4,
      },
    });

  getPointingDowloaded = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        downloaded: 'true',
      },
    });
  getPointingNotDowloaded = () =>
    axios.get(`${this.api}/pointing/`, {
      params: {
        downloaded: 'false',
      },
    });

  getPointingDataRecent = () =>
    axios.get(`${this.api}/pointing`, {
      params: {
        ordering: '-date_obs',
        pageSize: 1,
      },
    });

    getPointingExptime = () =>
    axios.get(`${this.api}/pointing/statistics`);
    
}
export default PointingApi;
