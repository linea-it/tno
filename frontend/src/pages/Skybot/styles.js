import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 113,
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
    // left: theme.spacing(2),
    left: 0,
    right: 0,
    bottom: -6,
    textAlign: 'center',
    margin: 'auto',
    // bottom: theme.spacing(1),
  },
  gridTable: {
    display: 'table',
  },
  gridTableRow: {
    display: 'table-row',
  },
}));

export default useStyles;
