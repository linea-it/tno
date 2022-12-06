import { api } from './Api'

export const getResultsByYear = () => api.get('/des/dashboard/skybot_by_year/').then((res) => res.data.results)

export const getResultsByDynclass = () => api.get('/des/dashboard/skybot_by_dynclass/').then((res) => res.data.results)
