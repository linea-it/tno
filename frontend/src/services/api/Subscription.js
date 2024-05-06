import { api } from './Api'

export const saveEmailSubscription = (email) => {
    const params = { email: email}
    //const params = { email: "antonio@gmail.com"}
    console.log("passando pela api")
    //return api.post('/subscription/',{
    //  email: "antonio@gmail.com"
    //}).then((res) => res.data.results)
    return api.post('/subscription/', params ).then((res) => res.data.results)
  }

 