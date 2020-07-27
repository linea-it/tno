import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
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
    zIndex: 1,
  },
  // shrinkLabel: {
  //   transform: 'translate(14px, -1px) scale(0.75) !important',
  // },
});

export default useStyles;
