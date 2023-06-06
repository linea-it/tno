import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 2,
    color: '#fff'
  },
  root: {
    padding: '0 5%',
    paddingBottom: '55px',
    background: '#e2e1e2',
  },
  titleItem: {
    fontFamily: 'arial',
    fontSize: '2em',
    paddingTop: '0.5em',  
    paddingBotton: '1em', 
    color: '#000000',    
  },
}))

export default useStyles
