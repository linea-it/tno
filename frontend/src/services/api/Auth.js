import { api, url } from './Api'

export function loggedUser() {
  return api
    .get('/users/i')
    .then((res) => {
      const result = res.data
      return result
    })
    .catch(() => {
      return null
    })
}

export function isAuthenticated() {
  return loggedUser().then((res) => {
    if (res !== null) {
      return true
    }
    return false
  })
}

export const urlLogin = `${url}/auth/login/`

export const urlLogout = `${url}/auth/logout/`
