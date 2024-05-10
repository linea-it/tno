import { api } from './Api'

export const getSubscriptionInfo = (id) => api.post(`/subscription/info/`, { c: id })

export const unsubscribe = (id) => api.post(`/subscription/unsubscribe/`, { c: id })

export const reactivateSubscription = (id) => api.post(`/subscription/reactivate/`, { c: id })

export const listPreferenceEventFilters = ({ queryKey }) => {
  const params = queryKey[1]
  const { subscriptionId } = params
  if (!subscriptionId) {
    return
  }

  return api.get(`newsletter/preferences`, { subscription_id: subscriptionId }).then((res) => res.data)
}
