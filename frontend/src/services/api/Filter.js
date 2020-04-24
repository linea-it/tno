import axios from 'axios';

export const getStatsById = ({ id }) => {
  const params = { id };
  return axios.get('/customlist/get_stats', { params }).then((res) => res.data.data);
};

export const getObjectsList = ({ tablename, page, pageSize }) => axios.get('/customlist/list_objects/', {
  params: { tablename, page, pageSize },
}).then((res) => res.data);

export const getCustomList = ({
  page, pageSize, ordering, search, filters = [],
}) => {
  const params = {
    page, pageSize, ordering, search,
  };
  filters.forEach((element) => {
    params[element.property] = element.value;
  });

  return axios.get('/customlist', {
    params,
  }).then((res) => res.data);
};

export const postCustomList = ({
  displayname,
  tablename,
  description,
  filter_dynclass,
  filter_magnitude,
  filter_diffdatenights,
  filter_morefilter,
  filter_name,
}) => {
  const params = {
    displayname,
    tablename,
    description,
  };

  if (filter_name !== '' && filter_name !== null) {
    params['filter_name'] = filter_name;
  } else {
    params['filter_dynclass'] = filter_dynclass;
    params['filter_magnitude'] = filter_magnitude;
    params['filter_diffdatenights'] = filter_diffdatenights;
    params['filter_morefilter'] = filter_morefilter;
  }

  return axios.post('/customlist/', params).then((res) => res.data);
};

export const getSkybotOutput = ({
  page = 1,
  pageSize,
  name,
  objectTable,
  useMagnitude,
  magnitude,
  useDifferenceTime,
  diffDateNights,
  moreFilter,
  checked,
  filters = [],
}) => {
  const params = {
    page,
    pageSize,
    name,
    objectTable,
    useMagnitude,
    magnitude,
    useDifferenceTime,
    diffDateNights,
    moreFilter,
    checked,
  };

  filters.forEach((element) => {
    if (element.value && element.value !== null) {
      params[element.property] = element.value;
    }
  });

  return axios.get('/skybotoutput/objects', {
    params,
  }).then((res) => res.data);
};

export const getSkybotOutputCount = ({
  name,
  objectTable,
  useMagnitude,
  magnitude,
  useDifferenceTime,
  diffDateNights,
  moreFilter,
  checked,
  filters = [],
}) => {
  const params = {
    name,
    objectTable,
    useMagnitude,
    magnitude,
    useDifferenceTime,
    diffDateNights,
    moreFilter,
    checked,
  };

  filters.forEach((element) => {
    if (element.value && element.value !== null) {
      params[element.property] = element.value;
    }
  });

  return axios.get('/skybotoutput/objects_count', {
    params,
  }).then((res) => res.data);
};


export const checkTableName = ({ tablename, status }) => {
  const params = {
    tablename,
    status,
  };

  return axios.get('/customlist/', {
    params,
  }).then((res) => res.data);
};

export const submitDownloadCcds = ({ id }) => {
  return axios.get(`customlist/${id}/download_ccds_by_list/`).then((res) => res.data);
};
