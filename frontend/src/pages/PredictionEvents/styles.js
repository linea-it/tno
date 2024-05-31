import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  listDetailCircunstances: {
    [theme.breakpoints.between(900, 945)]: {
      color: 'red',
      width: '430px',
      marginLeft: '-10px',             // secondary
      //margin: '-10px 0'
    }
  },

  listDetailObject: {
    [theme.breakpoints.between(900, 945)]: {
      color: 'blue',
      //marginLeft: theme.spacing(-3)
      width: '330px',
      //marginLeft: '12px',
      marginLeft: '30px'             // secondary
      //flex: '0 2'
      //[theme.spacing(14)]
    },
    [theme.breakpoints.between(945, 1100)]: {
      color: 'pink',
      //marginLeft: theme.spacing(-3)
      width: '333px',
      //marginLeft: '46px'
      margin: 'auto'
    },
    [theme.breakpoints.between(1100, 1175)]: {
      color: 'pink',
      //marginLeft: theme.spacing(-3)
      width: '530px',
      marginLeft: '-18px'
    }
  }
}))

export default useStyles
