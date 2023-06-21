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

export const getOccultationById = ({ id }) => api.get(`/occultations/${id}`).then((res) => res.data)

export const getNextTwenty = ({ page, pageSize, ordering}) => {
  const params = {
    page,
    pageSize,
    ordering
  }
  return api.get(`/occultations/next_twenty/`, { params }).then((res) => res.data)
}

export const getOccultationMap = ({object, date, time}) => {
  const params ={
    body: object,
    date: date,
    time: time
  }
  return sora.post('/map', params);
}





