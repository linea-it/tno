import { api } from './api'

export const getCCDCountByPeriodAndDynClass = (initialDate, finalDate, dynclass) =>
  api
    .get('/des/ccd/count_by_period/', {
      params: { start: initialDate, end: finalDate, dynclass: dynclass },
    })
    .then((res) => res.data);

export const createDownloadJob = ({ date_initial, date_final, dynclass, object_name }) => {
  let params = {
    dynclass,
    date_initial: date_initial,
    date_final: date_final,
  };

  if (object_name) {
    params = {
      ...params,
      name: object_name
    }
  }

  return api.post('/des/download_ccd/job/submit_job/', params);
};

export const getDownloadJobs = ({ page, pageSize, ordering }) => {
  const params = {
    page,
    pageSize,
    ordering,
  };

  return api.get('/des/download_ccd/job/', { params });
};

export const getDownloadJobById = (id) =>
  api.get(`/des/download_ccd/job/${id}/`)
    .then(res => res.data);

export const cancelDownloadJobById = (id) =>
  api.post(`/des/download_ccd/job/${id}/cancel_job/`).then((res) => res.data);

export const getObjectByName = (objectName) => {
  const params = { search: objectName, pageSize: 1 };

  return api.get('/des/skybot_position/', { params })
    .then(res => res.data.results[0])
}

export const getAllObjects = () => {
  const params = { pageSize: 999999 };

  return api.get('/des/skybot_position/', { params })
    .then(res => {
      const results = res.data.results;

      return results
        .filter((value, index, self) =>
          self.map(x => x.name).indexOf(value.name) === index
        )
    })
}

export const getDownloadProgress = (id) =>
  api.get(`/des/download_ccd/job/${id}/heartbeat/`)
    .then(res => res.data)

export const getSummaryByPeriodAndDynclass = ({ start, end, dynclass }) => {

  const params = {
    start,
    end,
    dynclass
  }

  return api.get('/des/ccd/summary_by_period/', { params })
    .then(res => res.data)
}
