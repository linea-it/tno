import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  root: {
    margin: `${theme.spacing(4)}px 0`,
  },
  carouselItem: {
    maxWidth: '150px',
    width: 'auto',
    height: 'auto',
    margin: 'auto',
  },
}));

export default styles;
