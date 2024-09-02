/* eslint-disable camelcase */
import { createContext, useEffect, useState, useContext } from 'react'
import { parseCookies, destroyCookie } from 'nookies'
import { loggedUser, urlLogin, urlLogout } from '../services/api/Auth.js'
import { environmentSettings } from '../services/api/Api.js'
import PropTypes from 'prop-types'

export const AuthContext = createContext({})

// Baseado neste exemplo: https://www.mikealche.com/software-development/how-to-implement-authentication-in-next-js-without-third-party-libraries
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [envSettings, setEnvSettings] = useState({
    NEWSLETTER_SUBSCRIPTION_ENABLED: false
  })
  // const { 'tno.csrftoken': csrftoken } = parseCookies()

  const isAuthenticated = !!user

  useEffect(() => {
    // Carrega os dados do usuario
    loggedUser()
      .then((u) => {
        setUser(u)
      })
      .catch((res) => {
        setUser(null)
        // logout()
      })
  }, [])

  // useEffect(() => {
  //   if (csrftoken) {
  //     // Carrega os dados do usuario logo apos o login
  //     loggedUser()
  //       .then((u) => {
  //         // Só permite o acesso ao dashboard se o usuario tiver o atributo user.profile.dashboard = true
  //         if (u.dashboard === true) {
  //           // Evita que no primeiro render do index o nome de usuario esteja em branco
  //           setUser(u)
  //         } else {
  //           logout()
  //         }
  //       })
  //       .catch((res) => {
  //         logout()
  //       })
  //   }
  // }, [csrftoken])

  async function signIn() {
    window.location.replace(urlLogin)
  }

  function logout() {
    const { 'tno.csrftoken': csrftoken } = parseCookies()

    destroyCookie(null, 'tno.csrftoken')
    setUser(null)

    if (csrftoken) {
    }
    window.location.replace(urlLogout)
  }

  useEffect(() => {
    environmentSettings()
      .then((res) => {
        setEnvSettings(res)
      })
      .catch(() => {
        // TODO: Aviso de erro
      })
  }, [])

  return <AuthContext.Provider value={{ user: user, isAuthenticated, signIn, logout, envSettings }}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node
}

export const useAuth = () => useContext(AuthContext)
