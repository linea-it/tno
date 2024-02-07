import { makeStyles } from '@material-ui/core/styles'
import { Height } from '../../../node_modules/@mui/icons-material/index'

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
  },
  errorText:{
    color: '#8B0000'
  },
  pad:{
    paddingTop:'10px',
    paddingBottom:'10px'
  },
  padDropBox:{
    paddingTop:'2px',
    paddingBottom:'2px'
  },
  input:{
    borderRadius: 4,
    position: 'relative',
    border: '1px solid #ced4da',
    width: 'auto',
    height: '43px'
  },
  divImg:{
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
  },
  mapImg:{
    width: '60%'
  },
  erroMap:{
    fontSize: '20px',
    color: 'red'
  }
}))

export default useStyles
