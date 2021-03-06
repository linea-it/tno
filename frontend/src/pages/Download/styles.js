import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  buttonGroupYear: {
    height: 'calc(100% - 1px)',
  },
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
  progressWrapper: {
    position: 'relative',
    paddingBottom: theme.spacing(1),
  },
  circularProgress: {
    margin: '5px auto',
  },
  fullWidth: {
    width: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default useStyles;
