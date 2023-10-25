import { api } from './Api'
import { sora } from './Sora'

export const getOccultations = ({ page, pageSize, ordering , start_date, end_date, filter_type, filter_value, min_mag, max_mag }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type == "dynclass"?filter_value:null,
    base_dynclass: filter_type == "base_dynclass"?filter_value:null,
    name: filter_type == "name"?filter_value.replaceAll(';', ','):null,
    min_mag,
    max_mag
  }
  return api.get('/occultations/', { params })
}

export const getOccultationHighlights = () => {
  return api.get('/occultations/highlights').then((res) => res.data)
}

export const filter_by_location = ({ page, pageSize, ordering , start_date, end_date, filter_type, filter_value, min_mag, max_mag, lat, long, radius }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type == "dynclass"?filter_value:null,
    base_dynclass: filter_type == "base_dynclass"?filter_value:null,
    name: filter_type == "name"?filter_value.replaceAll(';', ','):null,
    min_mag,
    max_mag,
    lat,
    long,
    radius
  }
  return api.get('/occultations/filter_location/', { params })
}

export const getOccultationById = ({ id }) => api.get(`/occultations/${id}`).then((res) => res.data)

export const getNextTwenty = ({ page, pageSize, ordering}) => {
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





