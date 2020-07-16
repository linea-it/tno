import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: '100%',
  },
  buttonGroupYear: {
    height: 'calc(100% - 1px)',
  },
  progressWrapper: {
    position: 'relative',
    paddingBottom: theme.spacing(1),
  },
  circularProgress: {
    position: 'absolute',
    left: theme.spacing(2),
    bottom: -6,
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
    zIndex: 1,
  },
}));

export default useStyles;
