import axios from 'axios';

const api = process.env.REACT_APP_API;

// Interceptar a requisicao
// // Add a request interceptor
// axios.interceptors.request.use(
//   function(config) {
//     // Do something before request is sent
//     return config;
//   },
//   function(error) {
//     // Do something with request error
//     return Promise.reject(error);
//   }
// );

// Interceptar a Resposta.
// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response;
  },
  function (error) {
    // Do something with response error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);

      if (error.response.status === 401) {
        logout();
      }

    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);

    return Promise.reject(error);
  }
);

export function isAuthenticated() {
  // return !!localStorage.token;
  if (localStorage.token) {
    axios.defaults.headers.common['Authorization'] =
      'Token ' + localStorage.token;
    return true;
  } else {
    return false;
  }
}

export function login(username, password, cb) {
  if (localStorage.token) {
    if (cb) cb(true);
    return;
  }
  getToken(username, password, res => {
    if (res.authenticated) {
      localStorage.token = res.token;
      axios.defaults.headers.common['Authorization'] = 'Token ' + res.token;
      if (cb) cb(true);
    } else {
      if (cb) cb(false);
    }
  });
}

export function logout() {
  console.log("logout()")
  delete localStorage.token;
  window.location.replace(window.location.hostname + '/login');
}

export function getToken(username, password, cb) {
  axios
    .post(`${api}/obtain-auth-token/`, {
      username: username,
      password: password,
    })
    .then(res => {
      var result = res.data;
      cb({
        authenticated: true,
        token: result.token,
      });
    })
    .catch(error => {
      // cb({
      //   authenticated: true,
      //   token: "dhsudhuasduas",
      // });

      const data = error.response.data;
      if ('non_field_errors' in data) {
        alert(data.non_field_errors[0]);
      }
    });
}
