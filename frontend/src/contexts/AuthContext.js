/* eslint-disable camelcase */
import { createContext, useEffect, useState, useContext } from 'react'
import { parseCookies, destroyCookie } from 'nookies'
import { loggedUser, urlLogin, urlLogout } from '../services/api/Auth.js'
import PropTypes from 'prop-types'

export const AuthContext = createContext({})

// Baseado neste exemplo: https://www.mikealche.com/software-development/how-to-implement-authentication-in-next-js-without-third-party-libraries
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const { 'tno.csrftoken': csrftoken } = parseCookies()

  const isAuthenticated = !!csrftoken

  useEffect(() => {
    if (csrftoken) {
      // Carrega os dados do usuario logo apos o login
      loggedUser()
        .then((u) => {
          // Evita que no primeiro render do index o nome de usuario esteja em branco
          setUser(u)
        })
        .catch((res) => {
          logout()
        })
    }
  }, [csrftoken])

  async function signIn() {
    window.location.replace(urlLogin)
  }

  function logout() {
    const { 'tno.csrftoken': csrftoken } = parseCookies()

    destroyCookie(null, 'tno.csrftoken')
    // delete api.defaults.headers.Authorization
    // delete api.defaults.headers['X-CSRFToken']
    setUser(null)

    if (csrftoken) {
    }
    window.location.replace(urlLogout)
  }

  return <AuthContext.Provider value={{ user: user, isAuthenticated, signIn, logout }}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node
}

export const useAuth = () => useContext(AuthContext)
