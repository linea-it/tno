import axios from 'axios';

export const url = process.env.REACT_APP_API;
axios.defaults.baseURL = url;

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
        logout();
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
  },
);

export function isAuthenticated() {
  if (localStorage.token) {
    axios.defaults.headers.common.Authorization = `Token ${localStorage.token}`;
    return true;
  }
  return false;
}

export function getToken(username, password, cb) {
  axios
    .post(`/obtain-auth-token/`, {
      username,
      password,
    })
    .then((res) => {
      const result = res.data;
      cb({
        authenticated: true,
        token: result.token,
      });
    })
    .catch((error) => {
      const { data } = error.response;
      if ('non_field_errors' in data) {
        alert(data.non_field_errors[0]);
      }
    });
}

export function login(username, password, cb) {
  if (localStorage.token) {
    if (cb) cb(true);
    return;
  }

  getToken(username, password, (res) => {
    if (res.authenticated) {
      localStorage.token = res.token;
      axios.defaults.headers.common.Authorization = `Token ${res.token}`;
      if (cb) cb(true);
    } else if (cb) cb(false);
  });
}

export function logout() {
  delete localStorage.token;
  window.location.replace(`${window.location.hostname}/login`);
}
