import { api } from './Api'

export const getEmailDb = () => {
  return api.get(`${window.location.origin}/api/subscription/`).then((res) => res.data.results)
  //return api.get(`/occultations/highlights_unique_asteroids/`).then((res) => res.data)
}

export const saveEmailSubscription = (email) => {
    const params = { email: email}
    //    params = { email: "antonio@gmail.com"}
    console.log("passando pela api")
    return api.post('/subscription/', params )//.then((res) => res.data.results)
  }

 