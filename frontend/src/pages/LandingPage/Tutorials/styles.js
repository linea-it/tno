import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  initContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  root: {
    paddingTop: 25,
  },
  item: {
    cursor: 'pointer',
    maxHeight: 460,
    overflow: 'overlay',
    borderRight: 'solid 1px #cccccc',
    borderBottom: 'solid 1px #cccccc',
    backgroundColor: '#f5f5f5',
    '&:hover': {
      background: '#efefef',
    },
  },
}));

export default styles;
