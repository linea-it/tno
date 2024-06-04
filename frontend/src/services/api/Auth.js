import { api, url } from './Api'

export function loggedUser() {
  return api.get('/users/i').then((res) => {
    const result = res.data
    return result
  })
}

export function acessTnoDev() {
  return api.get('/tno_dev').then((res) => {
    const result = res.data
    return result
  })
}

export const urlLogin = `${url}/auth/login/?next=/dashboard`

export const urlLogout = `${url}/auth/logout/?next=/dashboard`
