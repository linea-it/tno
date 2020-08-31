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
    position: 'absolute',
    // left: theme.spacing(2),
    left: 0,
    right: 0,
    bottom: -6,
    textAlign: 'center',
    margin: 'auto',
    // bottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
}));

export default useStyles;
