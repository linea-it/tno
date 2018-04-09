export function isAuthenticated() {
//   return !!localStorage.token;
    return true
}

// export function login(username, password) {

//     if (localStorage.token) {
//         return
//     }


// }


export function login(username, password) {
    if (localStorage.token) {
        return;
    }
    getToken(username, password, (res) => {
        if (res.authenticated) {
        }
        else {
        }
    });
}
export function getToken(username, password) {
    console.log("getToken()");
}


// module.exports = {
//   login: function(username, pass, cb) {
//     if (localStorage.token) {
//       if (cb) cb(true)
//       return
//     }
//     this.getToken(username, pass, (res) => {
//         if (res.authenticated) {
//             localStorage.token = res.token
//             if (cb) cb(true)
//           } else {
//             if (cb) cb(false)
//           }
//       });
//   },

//   logout: function() {
//     delete localStorage.token
//   },

//   loggedIn: function() {
//     return !!localStorage.token
//   },

//   getToken: function(username, pass, cb) {
//     $.ajax({
//         type: 'POST',
//         url: '/api/obtain-auth-token/',
//         data: {
//             username: username,
//             password: pass
//           },
//         success: function(res){
//             cb({
//                 authenticated: true,
//                 token: res.token
//               });
//           },
//       });
//   },
// };
