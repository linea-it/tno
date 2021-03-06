import { createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';

const light = createMuiTheme({
  palette: {
    primary: {
      light: '#5c6b7d',
      main: '#34465d',
      dark: '#243141',
      contrastText: '#fff',
    },
    secondary: pink,
    contrastText: '#fff',
    appbar: '#212121',
  },
  typography: {
    useNextVariants: true,
  },
  overrides: {
    Pagination: {
      activeButton: {
        color: pink[500],
      },
    },
    MuiCard: {
      root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    },
    MuiCardHeader: {
      root: {
        backgroundColor: 'rgb(248, 249, 252)',
        borderBottom: '1px solid rgb(227, 230, 240)',
        paddingTop: 8,
        paddingBottom: 8,
      },
      title: {
        color: '#34465d',
        fontSize: 16,
        fontWeight: 'bold',
      },
      action: {
        marginTop: -4,
      },
    },
    MuiTableRow: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(244, 244, 244, 1)',
        },
      },
    },
    MuiSkeleton: {
      text: {
        marginTop: 0,
        marginBottom: 0,
      },
    },
    initContainer: {
      paddingTop: 20,
      paddingBottom: 100,
    },
    // MuiCollapse: {
    //   wrapperInner: {
    //     paddingLeft: 15,
    //   },
    // },
  },
});

export default light;
