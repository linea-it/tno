import axios from 'axios'

export const url = process.env.REACT_APP_API

export function getAPIClient(ctx) {
  const api = axios.create({
    timeout: 180000,
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json'
    }
  })

  api.defaults.baseURL = url

  api.defaults.xsrfCookieName = 'tno.csrftoken'
  api.defaults.xsrfHeaderName = 'X-CSRFToken'
  api.defaults.withCredentials = true

  // Add a response interceptor
  api.interceptors.response.use(
    (response) =>
      // Do something with response data
      response,
    (error) => {
      // Do something with response error
      if (error.response) {
        // The request was made and the server responded with a status code

        if (error.response.status === 401) {
          // Não autorizado
          // TODO: Tratar quando o usuario tentar acessar uma api que ele nao tem permissao.
          // console.warn(error.request);
        }
        if (error.response.status === 403) {
          // Não está logado
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message)
      }

      return Promise.reject(error)
    }
  )

  return api
}

export const api = getAPIClient()

export const parseFilters = (filterModel) => {
  const params = {}

  if (filterModel === undefined) {
    return params
  }
  // Handle Search
  if (filterModel.quickFilterValues !== undefined && filterModel.quickFilterValues?.length > 0) {
    params['search'] = filterModel.quickFilterValues.join(' ')
  }
  if (filterModel.items !== undefined && filterModel.items.length > 0) {
    filterModel.items.forEach((filter) => {
      const { field, operator, value } = filter
      if (value !== undefined) {
        if (['=', 'equals'].indexOf(operator) > -1) {
          params[field] = value
        }
        if (operator === '!=') {
          params[`${field}!`] = value
        }
        if (operator === '>') {
          params[`${field}__gt`] = value
        }
        if (operator === '>=') {
          params[`${field}__gte`] = value
        }
        if (operator === '<') {
          params[`${field}__lt`] = value
        }
        if (operator === '<=') {
          params[`${field}__lte`] = value
        }
        if (operator === 'contains') {
          params[`${field}__icontains`] = value
        }
        if (operator === 'startsWith') {
          params[`${field}__istartswith`] = value
        }
        if (operator === 'endsWith') {
          params[`${field}__iendswith`] = value
        }
        if (operator === 'isAnyOf') {
          params[`${field}__in`] = value.join(',')
        }
        if (operator === 'is') {
          if (value.toLowerCase() === 'true') {
            params[`${field}`] = true
          } else if (value.toLowerCase() === 'false') {
            params[`${field}`] = false
          }
        }
      } else {
        if (operator === 'isEmpty') {
          params[`${field}__isnull`] = true
        }
        if (operator === 'isNotEmpty') {
          params[`${field}__isnull`] = false
        }
      }
    })
  }
  return params
}
