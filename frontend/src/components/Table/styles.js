import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  wrapPaper: {
    position: 'relative',
    paddingTop: '10px',
  },
  formControl: {
    width: '180px',
    position: 'absolute',
    top: '8px',
    left: '24px',
    zIndex: '999',
  },
  noDataCell: {
    padding: '48px 0px',
  },
  noDataWrapper: {
    left: '50%',
    display: 'inline-block',
    // position: 'sticky',
  },
  noDataText: {
    display: 'inline-block',
    transform: 'translateX(-50%)',
  },
});

export default useStyles;
