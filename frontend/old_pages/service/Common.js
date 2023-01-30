import { api } from './api'
export const readFile = (filepath) =>
  api
    .get('/read_file/', {
      params: { filepath },
    })
    .then((res) => res.data);
