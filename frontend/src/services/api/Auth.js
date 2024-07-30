import { api, url } from './Api'

export function loggedUser() {
  return api.get('/users/i').then((res) => {
    const result = res.data
    return result
  })
}

export function whichEnvironment() {
  return api.get('/which_environment').then((res) => {
    const result = res.data
    return result
  })
}

export const urlLogin = `${url}/auth/login/?next=/dashboard`

export const urlLogout = `${url}/auth/logout/?next=/dashboard`
