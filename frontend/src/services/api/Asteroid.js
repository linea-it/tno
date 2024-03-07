import { api } from './Api'

export const updateAsteroidTable = () => {
  return api.get('asteroids/update_asteroid_table/')
}

export const countAsteroidTable = () => {
  return api.get('asteroids/count_asteroid_table/')
}

export const getDynClassList = () => api.get(`/asteroids/dynclasses/`).then((res) => res.data.results)

export const getBaseDynClassList = () => api.get(`/asteroids/base_dynclasses/`).then((res) => res.data.results)

export const getAsteroidsList = () => api.get(`/asteroids/`).then((res) => res.data.results)

export const getFilteredAsteroidsList = (name) => api.get(`/asteroids/?search=` + name).then((res) => res.data.results)

export const getAsteroidsWithPredictionList = () => api.get(`/asteroids/with_prediction/`).then((res) => res.data.results)

export const getFilteredWithPredictionList = (name) => api.get(`/asteroids/with_prediction/?name=` + name).then((res) => res.data.results)

export const listAllAsteroids = ({ queryKey }) => {
  const params = queryKey[1]
  const { name } = params
  return api.get(`/asteroids`, { params: { search: name } }).then((res) => res.data)
}

export const listAllBaseDynClass = () => {
  return api.get(`/asteroids/base_dynclasses/`).then((res) => res.data)
}

export const listAllDynClass = () => {
  return api.get(`/asteroids/dynclasses/`).then((res) => res.data)
}
