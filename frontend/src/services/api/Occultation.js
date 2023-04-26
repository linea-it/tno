import { api } from './Api'

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

