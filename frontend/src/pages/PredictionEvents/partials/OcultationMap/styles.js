import { makeStyles } from '@mui/styles'
import { ListItem } from '../../../node_modules/@mui/material/index'
import { color } from 'd3'

const styles = makeStyles( (theme) => ({
  map: { 
    height: '80vh',
    width: '100%',
    borderRadius: '15px',
 },
 /*
  map: { 
    [theme.breakpoints.only('sm')]: {
    height: '80vh',
    width: '100%',
    borderRadius: '15px',
    },
 },*/
  mapPrint: {
    [theme.breakpoints.only('sm')]: {
      backgroundColor: theme.palette.primary.main,
      height: '100px',
    },
  },
  itemValueText: {
    [theme.breakpoints.only('sm')]: {
      color: 'yellow',
      fontSize: '0.1px!important',
      /*height: '360px',*/
    },
  },
  oculted: {
    [theme.breakpoints.down('md')]: {
    display: 'none'
    }
  }
}))

export default styles