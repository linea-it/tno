import { api } from './Api'

export const getOccultations = ({ page, pageSize, ordering , start_date, end_date, filter_type, filter_value }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    filter_type,
    filter_value
  }
  // var queryString = '';

  // if(dateStart || dateEnd || (filterType && filterValue))
  //   queryString = '?'
  // if(dateStart)
  //   queryString += "start_date="+ dateStart + " 00:00:00";
  // if(dateEnd)
  //   queryString += "end_date=" + dateEnd + " 00:00:00"

  return api.get('/occultations/', { params })
}

