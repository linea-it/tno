import axios from 'axios';

export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

// Add a response interceptor
axios.interceptors.response.use(
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
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    console.error(error.config);

    return Promise.reject(error);
  }
);

export function loggedUser() {
  return axios
    .get('/users/i')
    .then((res) => {
      const result = res.data;
      return result;
    })
    .catch(() => {
      return null;
    });
}

export function isAuthenticated() {
  return loggedUser().then((res) => {
    if (res !== null) {
      return true;
    }
    return false;
  });
}

export function logout() {
  window.location.replace(`${url}/auth/logout`);
}
