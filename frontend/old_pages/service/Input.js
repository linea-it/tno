import { api } from './api'

export const getBspJpl = ({ page, pageSize, search }) => {
  return api.get('/bsp_jpl/', {
    params: {
      page,
      pageSize,
      search,
    },
  });
};

export const getObservationFiles = ({ page, pageSize, search, ordering }) => {
  return api.get('/observation_files', {
    params: {
      page,
      pageSize,
      search,
      ordering,
    },
  });
};

export const getOrbitalParameterFiles = ({
  page,
  pageSize,
  search,
  ordering,
}) => {
  return api.get('/orbital_parameter', {
    params: {
      page,
      pageSize,
      search,
      ordering,
    },
  });
};

export const getJohnstonArchives = ({ page, pageSize, search }) => {
  return api.get('/known_tnos_johnston', {
    params: {
      page,
      pageSize,
      search,
    },
  });
};

export const getJohnstonArchivesById = (id) => {
  return api.get(`/known_tnos_johnston/${id}`);
};

export const updateJohnstonList = () => {
  return api.get(`/known_tnos_johnston/update_list`);
};
