import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'dark' ? 800 : 400]
  },
  bar: {
    borderRadius: 5
  }
}))

export default useStyles
