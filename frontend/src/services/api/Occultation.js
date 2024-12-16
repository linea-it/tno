import { api } from './Api'

export const getOccultations = ({ page, pageSize, ordering, start_date, end_date, filter_type, filter_value, min_mag, max_mag }) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type === 'dynclass' ? filter_value : null,
    base_dynclass: filter_type === 'base_dynclass' ? filter_value : null,
    name: filter_type === 'name' ? filter_value.replaceAll(';', ',') : null,
    min_mag,
    max_mag
  }
  return api.get('/occultations/', { params })
}

export const filter_by_location = ({
  page,
  pageSize,
  ordering,
  start_date,
  end_date,
  filter_type,
  filter_value,
  min_mag,
  max_mag,
  lat,
  long,
  radius
}) => {
  const params = {
    page,
    pageSize,
    ordering,
    start_date,
    end_date,
    dynclass: filter_type === 'dynclass' ? filter_value : null,
    base_dynclass: filter_type === 'base_dynclass' ? filter_value : null,
    name: filter_type === 'name' ? filter_value.replaceAll(';', ',') : null,
    min_mag,
    max_mag,
    lat,
    long,
    radius
  }
  return api.get('/occultations/filter_location/', { params })
}

export const getOccultationById = ({ id }) => {
  if (!id) {
    return
  }
  return api.get(`/occultations/${id}`).then((res) => res.data)
}

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
  const params = queryKey[1]
  const { id, force } = params
  if (!id) {
    return
  }

  return api.get(`/occultations/${id}/get_or_create_map`, { params: { force: force } }).then((res) => res.data)
}

export const getHighlightsUniqueAsteroids = () => {
  return api.get(`/occultations/highlights_unique_asteroids/`).then((res) => res.data)
}

export const getHighlightsWeeklyForecast = () => {
  return api.get(`/occultations/highlights_weekly_forecast/`).then((res) => res.data)
}

export const getHighlightsMonthlyForecast = () => {
  return api.get(`/occultations/highlights_monthly_forecast/`).then((res) => res.data)
}

export const getHighlightsMapsStats = () => {
  return api.get(`/occultations/highlights_maps_stats/`).then((res) => res.data)
}

export const geoFilterIsValid = (value) => {
  if (value.geo) {
    if (value.latitude === undefined || value.latitude === '') {
      return false
    }
    if (value.latitude < -90 || value.latitude > 90) {
      return false
    }

    if (value.longitude === undefined || value.longitude === '') {
      return false
    }

    if (value.longitude < -180 || value.longitude > 180) {
      return false
    }
  }
  return true
}

const parsePredictEventsFilters = (params) => {
  const { paginationModel, filters, sortModel, search } = params
  const { pageSize } = paginationModel

  // Fix Current page
  let page = paginationModel.page + 1

  // Parse Sort options
  let sortFields = []
  if (sortModel !== undefined && sortModel.length > 0) {
    sortModel.forEach((e) => {
      if (e.sort === 'asc') {
        sortFields.push(e.field)
      } else {
        sortFields.push(`-${e.field}`)
      }
    })
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
        newFilters['name'] = filters.filterValue.map((row) => row.name).join(',')
      } else {
        newFilters[filters.filterType] = filters.filterValue
      }
    }

    // Filtro por magnitude maxima
    newFilters.magnitude_max = filters.maginitudeMax

    // Filtro por magnitude Drop Maior que
    if (filters.maginitudeDropMin !== undefined && filters.maginitudeDropMin !== '') {
      newFilters.magnitude_drop_min = filters.maginitudeDropMin
    }

    // Filtro por Event Duration Maior que
    if (filters.eventDurationMin !== undefined && filters.eventDurationMin !== '') {
      newFilters.event_duration_min = filters.eventDurationMin
    }

    if (filters.closestApproachUncertainty !== undefined && filters.closestApproachUncertainty !== '') {
      newFilters.closest_approach_uncertainty_km_max = filters.closestApproachUncertainty
    }

    // Filtro por Object Diameter Range min, max
    if (filters.diameterMin !== undefined && filters.diameterMin !== '') {
      newFilters.diameter_min = filters.diameterMin
    }

    if (filters.diameterMax !== undefined && filters.diameterMax !== '') {
      newFilters.diameter_max = filters.diameterMax
    }

    // Filtro por Local Solar Time
    if (filters.solar_time_enabled === true) {
      if (filters.solar_time_after !== undefined && filters.solar_time_before !== '') {
        if (filters.solar_time_after.isValid() && filters.solar_time_before.isValid()) {
          newFilters.local_solar_time_after = filters.solar_time_after.format('HH:mm:ss')
          newFilters.local_solar_time_before = filters.solar_time_before.format('HH:mm:ss')
        }
      }
    }

    // Filtro por Nighside
    // Caso Nighside seja false ignora esse filtro. se não o backend vai retornar apenas resultados nightside = false.
    newFilters.nightside = filters.nightside === true ? true : null

    // GEO Filter
    if (filters.geo === true && geoFilterIsValid(filters)) {
      newFilters.latitude = filters.latitude
      newFilters.longitude = filters.longitude
      newFilters.location_radius = filters.radius
    }

    // Filtro por Jobid
    if (filters.jobid) {
      newFilters.jobid = filters.jobid
    }
  }
  return { params: { page, pageSize, ordering, ...newFilters, search } }
}

export const allPredictionEventsByCursor = (queryOptions, pageParam) => {
  let pageSize = 30
  let params = parsePredictEventsFilters(queryOptions)
  if (pageParam === 0) {
    pageParam = 1
  }
  params.params.page = pageParam
  params.params.pageSize = pageSize
  return api.get(`/occultations/`, params).then((res) => res.data)
}

export const listAllPredictionEvents = ({ queryKey }) => {
  const params = parsePredictEventsFilters(queryKey[1])
  return api.get(`/occultations/`, params).then((res) => res.data)
}

export const listAllAsteroidsWithEvents = ({ queryKey }) => {
  const params = queryKey[1]
  const { name } = params

  return api.get(`/asteroids/with_prediction/`, { params: { name } }).then((res) => res.data)
}

export const allBaseDynclassWithEvents = () => {
  return api.get(`/occultations/base_dynclass_with_prediction/`).then((res) => res.data)
}

export const allDynclassWithEvents = () => {
  return api.get(`/occultations/dynclass_with_prediction/`).then((res) => res.data)
}

export const getOccultationPaths = ({ queryKey }) => {
  const params = queryKey[1]
  const { id, force } = params
  if (!id) {
    return
  }

  return api.get(`/occultations/${id}/get_occultation_paths`, { params: { force: force } }).then((res) => res.data)
}
