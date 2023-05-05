import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',    
    height: 30,
    position: 'fixed',
    zIndex:10000
  },
  appBarDrawerClose: {
    top: 'auto',
    bottom: 0,
    backgroundColor: '#212121'   
  },
  poweredBy: {
    display: 'inline-block',
    verticalAlign: 'middle',
    color: '#fff',
    paddingTop:'5px'
  }
}))

export default useStyles
