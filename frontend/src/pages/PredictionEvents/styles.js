import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  listDetailCircunstances: {
    [theme.breakpoints.between(900, 945)]: {
      //color: 'red',
      width: '430px',
      marginLeft: '-10px'
    }
  },

  listDetailObject: {
    [theme.breakpoints.between(900, 945)]: {
      //color: 'blue',
      width: '330px',
      marginLeft: '30px' 
    },
    [theme.breakpoints.between(945, 1100)]: {
      //color: 'pink',
      width: '333px',
      margin: 'auto'
    },
    [theme.breakpoints.between(1100, 1175)]: {
      //color: 'pink',
      width: '530px',
      marginLeft: '-18px'
    }
  }
}))

export default useStyles
