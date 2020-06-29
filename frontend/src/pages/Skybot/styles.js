import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  buttonGroupYear: {
    height: 'calc(100% - 1px)',
  },
  progressWrapper: {
    position: 'relative',
  },
  circularProgress: {
    position: 'absolute',
    right: theme.spacing(2),
    bottom: theme.spacing(1),
  },
}));

export default useStyles;
