import { api } from './Api'

export const listAllAsteroidJobs = ({ queryKey }) => {
  const params = queryKey[1]
  const { paginationModel, filters, sortModel } = params
  const { pageSize } = paginationModel

  // Fix Current page
  let page = paginationModel.page + 1

  // Parse Sort options
  let sortFields = []
  if (sortModel !== undefined && sortModel.length > 0) {
    sortModel.forEach((e) => {
      if (e.sort === 'asc') {
        sortFields.push(e.field)
      } else {
        sortFields.push(`-${e.field}`)
      }
    })
  }
  let ordering = sortFields.length !== 0 ? sortFields.join(',') : null

  const newFilters = {}
  if (filters !== undefined) {
  }

  return api.get(`/asteroid_jobs/`, { params: { page, pageSize, ordering, ...newFilters } }).then((res) => res.data)
}

export const getAsteroidJobById = ({ queryKey }) => {
  const [params] = queryKey
  const { id } = params
  return api.get(`/asteroid_jobs/${id}`).then((res) => res.data)
}
