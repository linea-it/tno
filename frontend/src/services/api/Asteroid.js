import { api } from './Api'

export const updateAsteroidTable = () => {
  return api.get('asteroids/update_asteroid_table/')
}

export const countAsteroidTable = () => {
  return api.get('asteroids/count_asteroid_table/')
}

export const clearAsteroidTable = () => {
  return api.post('asteroids/delete_all/')
}

export const getDynClassList = () => api.get(`/asteroids/dynclasses/`).then((res) => res.data.results)

export const getBaseDynClassList = () => api.get(`/asteroids/base_dynclasses/`).then((res) => res.data.results)

export const getAsteroidsList = () => api.get(`/asteroids/`).then((res) => res.data.results)

export const getAsteroidsWithPredictionList = () => api.get(`/asteroids/with_prediction/`).then((res) => res.data.results)

export const getCatalogList = () => api.get(`/catalog/`).then((res) => res.data.results)
