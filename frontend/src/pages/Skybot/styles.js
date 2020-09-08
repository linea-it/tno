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
    margin: '5px auto',
  },
  gridTable: {
    display: 'table',
  },
  gridTableRow: {
    display: 'table-row',
  },
}));

export default useStyles;
