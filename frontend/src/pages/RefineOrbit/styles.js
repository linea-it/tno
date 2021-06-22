import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    margin: '5px auto',
  },
  gridTable: {
    display: 'table',
  },
  gridTableRow: {
    display: 'table-row',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  // typographyButton: {
  //   fontSize: '0.9rem',
  //   fontWeight: 700,
  //   marginTop: '.6rem',
  //   marginBottom: 0,
  // },
  // customOptions: {
  //   display: 'flex',
  //   alignItems: 'flex-end',
  // },
  // customOptionCheckbox: {
  //   minWidth: 38,
  //   marginRight: 4,
  // },

  relativePosition: {
    position: 'relative',
  },
  disabledArea: {
    backgroundColor: 'rgba(0, 0, 0, .2)',
    position: 'absolute',
    left: 8,
    right: 8,
    top: 8,
    bottom: 8,
    borderRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 1,
  },

  fileInputBtn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    textTransform: 'none',
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.54)',
    padding: '0 8px 4px 0',
    minHeight: 48,
    // borderBottom: '1px solid rgba(0, 0, 0, 0.54)',
    // borderRadius: 0,

    '&:hover, &:active, &:focus': {
      backgroundColor: 'transparent',
    },

    '&:hover hr': {
      backgroundColor: 'rgba(0, 0, 0, 0.87)',
      height: 2,
    },
  },

  fileInputDivider: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
  },

  // Dialog:
  dialogCardHeader: {
    paddingBottom: 4,
  },

  tabCardContent: {
    padding: '0 0 20px 0',
    overflow: 'auto',
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  tabSubtitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: '12px 0 0',
  },
}));

export default useStyles;
