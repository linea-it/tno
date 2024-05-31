import { makeStyles } from '@mui/styles'

const useStyles = makeStyles((theme) => ({
  listDetailCircunstances: {
    [theme.breakpoints.between(900, 945)]: {
      //color: 'red',
      width: '430px',
      marginLeft: '-10px'
    }
  },

  listDetailStar: {
    [theme.breakpoints.between(900, 1100)]: {
      width: '372px',
      margin: 'auto'
    },
    [theme.breakpoints.up(1100)]: {
      width: '380px',
      margin: 'auto',
      padding: theme.spacing(18)
    }
  },

  listDetailObject: {
    [theme.breakpoints.between(900, 945)]: {
      width: '330px',
      marginLeft: '30px' 
    },
    [theme.breakpoints.between(945, 1100)]: {
      width: '333px',
      margin: 'auto'
    },
    [theme.breakpoints.between(1100, 1175)]: {
      width: '530px',
      marginLeft: '-18px'
    }
  }
}))

export default useStyles
