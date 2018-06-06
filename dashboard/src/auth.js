import axios from 'axios';

const api = process.env.REACT_APP_API;

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
  delete localStorage.token;
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
