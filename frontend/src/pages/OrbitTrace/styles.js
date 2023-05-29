import { makeStyles } from '@material-ui/core/styles'

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
  loadingPlot:{
    margin: '150px auto',
  },
  tooltip: {
    fontSize: "1.4em",
  },
  MuiIconButtonRoot:{
padding:'0px !Important',
  }
}))

export default useStyles
