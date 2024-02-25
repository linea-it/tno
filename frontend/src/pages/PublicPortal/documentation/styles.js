import { makeStyles } from '@mui/styles'

const styles = makeStyles(() => ({
  initContainer: {
    paddingTop: 20,
    paddingBottom: 100
  },
  grid: {
    margin: 'auto'
  },
  textFormat: {
    marginTop: 40,
    fontSize: '1.07rem!important',
    fontFamily: 'arial',
    fontWeight: '100',
    lineHeight: '1.5',
    textAlign: 'justify',
    color: 'black',
    letterSpacing: '0.0em',
    textTransform: 'none'
  },
  menuContainer: {
    position: 'sticky',
    top: -10,
    height: '50vh',
    overflowY: 'auto'
  }
}))

export default styles
