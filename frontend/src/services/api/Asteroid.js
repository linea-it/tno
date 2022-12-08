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