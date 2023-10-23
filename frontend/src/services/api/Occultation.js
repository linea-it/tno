import { FilterSharp } from '../../../node_modules/@mui/icons-material/index'
import { api } from './Api'

export const getOccultations = ({ page, pageSize, ordering, start_date, end_date, filter_type, filter_value, min_mag, max_mag }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type == "dynclass" ? filter_value : null,
    base_dynclass: filter_type == "base_dynclass" ? filter_value : null,
    name: filter_type == "name" ? filter_value.replaceAll(';', ',') : null,
    min_mag,
    max_mag
  }
  return api.get('/occultations/', { params })
}

export const filter_by_location = ({ page, pageSize, ordering, start_date, end_date, filter_type, filter_value, min_mag, max_mag, lat, long, radius }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type == "dynclass" ? filter_value : null,
    base_dynclass: filter_type == "base_dynclass" ? filter_value : null,
    name: filter_type == "name" ? filter_value.replaceAll(';', ',') : null,
    min_mag,
    max_mag,
    lat,
    long,
    radius
  }
  return api.get('/occultations/filter_location/', { params })
}

export const getOccultationById = ({ id }) => api.get(`/occultations/${id}`).then((res) => res.data)

export const getNextTwenty = ({ page, pageSize, ordering }) => {
  const params = {
    page,
    pageSize,
    ordering
  }
  return api.get(`/occultations/next_twenty/`, { params }).then((res) => res.data)
}

export const getStarByOccultationId = ({ id }) => api.get(`/occultations/${id}/get_star_by_event`).then((res) => res.data)

export const getOrCreatePredictionMap = ({ queryKey }) => {
  const [_, params] = queryKey
  const { id, force } = params
  if (!id) { return }

  return api.get(`/occultations/${id}/get_or_create_map`, { params: { force: force } }).then(res => res.data)
}

export const getOccultationHighlights = () => {
  return api.get(`/occultations/highlights/`).then(res => res.data)
}

export const listAllPredictionEvents = ({ queryKey }) => {
  const [_, params] = queryKey

  const { paginationModel, filters, sortModel } = params
  const { pageSize } = paginationModel

  // Fix Current page
  let page = paginationModel.page + 1

  // Parse Sort options
  let sortFields = []
  if (sortModel !== undefined && sortModel.length > 0) {
    sortModel.forEach((e) => {
      if (e.sort === 'asc') {
        sortFields.push(e.field);
      } else {
        sortFields.push(`-${e.field}`);
      }
    });
  }
  let ordering = sortFields.length !== 0 ? sortFields.join(',') : null

  const newFilters = {}
  if (filters !== undefined) {

    // Filtro por periodo
    newFilters.date_time_after = filters.date_time_after
    newFilters.date_time_before = filters.date_time_before

    // Filtro por Nome, Dynclass e Base Dynclass
    if (filters.filterValue !== undefined && filters.filterValue !== '') {

      if (filters.filterType === 'name') {
        newFilters['name'] = filters.filterValue.map(row => row.name).join(',')
      } else {
        newFilters[filters.filterType] = filters.filterValue
      }
    }

    // Filtro por magnitude maxima
    newFilters.mag_g_max = filters.maginitudeMax
  }

  console.log("NewFilters: ", newFilters)

  return api.get(
    `/occultations/`, { params: { page, pageSize, ordering, ...newFilters } })
    .then((res) => res.data);
};

export const listAllAsteroidsWithEvents = ({ queryKey }) => {
  const [_, params] = queryKey
  const { name } = params

  return api.get(`/asteroids/with_prediction/`, { params: { name } }).then(res => res.data)
}

export const allBaseDynclassWithEvents = () => {
  return api.get(`/occultations/base_dynclass_with_prediction/`).then(res => res.data)
}

export const allDynclassWithEvents = () => {
  return api.get(`/occultations/dynclass_with_prediction/`).then(res => res.data)
}

