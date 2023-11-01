import { api, url } from './Api'

export function loggedUser() {
  return api
    .get('/users/i')
    .then((res) => {
      // const result = res.data
      // return result
      return {username: "gverde", dashboard:true}
    })
    .catch(() => {
      // return null
      return {username: "gverde", dashboard:true}
    })
}

export function isAuthenticated() {
  return loggedUser().then((res) => {
    return true
    // if (res !== null) {
    //   return true
    // }
    // return false
  })
}

export const urlLogin = `${url}/auth/login/`

export const urlLogout = `${url}/auth/logout/`
