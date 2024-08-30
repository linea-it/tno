import { api, url } from './Api'
import { destroyCookie, setCookie } from 'nookies'

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

export function logout() {
  destroyCookie({}, 'solarsystem.token')
  window.location.href = `${url}/auth/logout/?next=/`
}

export const urlLogin = `${url}/auth/login/?next=/dashboard`

export const urlLogout = `${url}/auth/logout/?next=/dashboard`

export const delete_account = (email) => {
  return api.post('/users/delete_account/', { email: email })
}

// --------------------------------------------------
// Public Authorization
// --------------------------------------------------
export const sendPasswordLessCode = (email) => api.post(`/pwl/auth/email/`, { email: email })

export const passwordLessSignIn = (email, token) =>
  api.post(`/pwl/auth/token/`, { email: email, token: token }).then((res) => {
    console.log('Autehntication success')
    console.log('Token:', res.data.token)

    setCookie(null, 'solarsystem.token', res.data.token, {
      maxAge: 30 * 24 * 60 * 60
    })

    // Redireciona para Home
    window.location.replace(window.location.origin)
  })
