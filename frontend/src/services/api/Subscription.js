import { api } from './Api'

export const saveEmailSubscription = ({ email }) => {
    const params = {
      email
    }
  
    return api.post('/subscription/', { params })
  }

