import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  wrapPaper: {
    position: 'relative',
    paddingTop: '10px'
  },
  formControl: {
    width: '180px',
    position: 'absolute',
    top: '8px',
    left: '24px',
    zIndex: '999'
  },
  noDataCell: {
    padding: '48px 0px',
    textAlign: 'center'
  },
  noDataWrapper: {
    left: '50%',
    display: 'inline-block'
  },
  noDataText: {
    display: 'inline-block',
    transform: 'translateX(-50%)'
  },
  btn: ({ align }) => ({
    textTransform: 'capitalize',
    padding: '1px 5px',
    width: '7em',
    minHeight: '1em',
    display: 'block',
    textAlign: 'center',
    lineHeight: '2',
    boxShadow: `0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
    0px 3px 1px -2px rgba(0, 0, 0, 0.12)`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    margin: align === 'center' ? 'auto' : 'initial',
    float: align === 'center' ? 'none' : align
  }),
  btnSuccess: {
    // backgroundColor: '#009900',
    // color: '#fff',
    color: '#009900'
  },
  btnFailure: {
    // backgroundColor: '#ff1a1a',
    // color: '#fff',
    color: '#ff1a1a'
  },
  btnAborted: {
    // backgroundColor: theme.palette.secondary[500],
    // color: '#fff',
    color: theme.palette.secondary[500]
  },
  btnRunning: {
    // backgroundColor: '#ffba01',
    // color: '#000',
    color: '#ffba01'
  },
  btnNotExecuted: {
    // backgroundColor: '#ABA6A2',
    // color: '#fff',
    color: '#ABA6A2'
  },
  btnWarning: {
    // backgroundColor: '#D79F15',
    // color: '#FFF',
    color: '#D79F15'
  },
  btnAborting: {
    color: '#e19f41'
  },
  container: {
    position: 'relative'
  }
}))

export default useStyles
