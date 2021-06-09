import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    margin: '5px auto',
  },
  // gridTable: {
  //   display: 'table',
  // },
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

  // Dialog:
  dialogCardHeader: {
    paddingBottom: 4,
  },
}));

export default useStyles;
