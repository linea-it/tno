import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 113
  },
  buttonGroupYear: {
    height: 'calc(100% - 1px)'
  },
  progressWrapper: {
    position: 'relative',
    paddingBottom: theme.spacing(1)
  },
  circularProgress: {
    margin: '5px auto'
  },
  gridTable: {
    display: 'table'
  },
  gridTableRow: {
    display: 'table-row'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  chipError: {
    color: `${theme.palette.error.light} !important`,
    borderColor: `${theme.palette.error.light} !important`
  }
}))

export default useStyles
