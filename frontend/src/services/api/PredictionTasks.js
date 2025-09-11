import { api } from './Api'

export const getPredictionTasksList = ({ queryKey }) => {
  const params = queryKey[1]
  const { paginationModel, sortModel } = params
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

  return api.get(`/predict_occultation/task/`, { params: { page, pageSize, ordering } }).then((res) => res.data)
}

export const getPredictionTasksGroupByState = ({ queryKey }) => {
  const params = queryKey[1]

  return api.get(`/predict_occultation/task/group_by_state`, { params: { ...params } }).then((res) => res.data)
}

export const getPredictionTasksByState = ({ queryKey }) => {
  const params = queryKey[1]

  return api.get(`/predict_occultation/task`, { params: { ...params } }).then((res) => res.data)
}