import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles({  
  grid: {
    margin: 'auto'
  },
  titleItem: {    
    marginTop: '10px',
    fontSize: '1.3em',
    paddingTop: '0.5em',   
    color: '#000000'    
  },
  celula:{
    backgroundColor:'#cccccc',
    textAlign: 'center',
    padding: '10px'
  },
  mouse:{
    cursor: 'pointer'
  },
  btnPeriod:{
    paddingTop:'7px'
  },
  formControl: {
    minWidth: 113
  },
  buttonGroupYear: {
    height: 'calc(100% - 1px)'
  },
  progressWrapper: {
    position: 'relative'    
  },
  gridTable: {
    display: 'table'
  },
  gridTableRow: {
    display: 'table-row'
  },
  backdrop: {   
    color: '#fff'
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
  loadingTable:{
    display: 'block !important',
    marginLeft: 'auto !important',
    marginRight: 'auto !important',
    fontSize: '40px'
  },
  selected:{
    backgroundColor:'#9b9a9a',
    textAlign: 'center',
    padding: '10px'
  },
})

export default styles
