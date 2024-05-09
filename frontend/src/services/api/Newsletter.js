import { api } from './Api'

// export const getSubscriptionInfo = ({ queryKey }) => {
//   const params = queryKey[1]
//   const { id } = params
//   if (!id) {
//     return
//   }

//   return api.post(`subscription/info/`, { c: id }).then((res) => res.data)
// }

export const getSubscriptionInfo = (id) => api.post(`/subscription/info/`, { c: id })

export const unsubscribe = (id) => api.post(`/subscription/unsubscribe/`, { c: id })

export const reactivateSubscription = (id) => api.post(`/subscription/reactivate/`, { c: id })
