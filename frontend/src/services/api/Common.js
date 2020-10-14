import axios from 'axios';

export const readFile = (filepath) =>
  axios
    .get('/read_file/', {
      params: { filepath },
    })
    .then((res) => res.data);
