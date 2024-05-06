import { api } from './Api'

export const saveEmailSubscription = (email) => {
    const params = { email: email}
    //    params = { email: "antonio@gmail.com"}
    console.log("passando pela api")
    return api.post('/subscription/', params )//.then((res) => res.data.results)
  }

 