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

// completar todos os paramentros de entrada da tabela
export const saveListPreferenceEventFilters = ({ 
  subscriptionId, 
  filter_name,
  frequency, 
  filter_type, 
  filter_value 
}) => {
  const params = { 
    subscription_id: subscriptionId, 
    filter_name: filter_name,
    frequency: frequency, 
    filter_type: filter_type,
    filter_value: filter_value
 }
  
  console.log("passando pela api saveListPreferenceEventFilters")
  console.log(params)
  return api.post(`newsletter/preferences/`, params )//.then((res) => res.data.results)
}
