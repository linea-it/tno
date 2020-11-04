import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 2,
    marginTop: theme.spacing(6),
    margin: '48px 300px 96px 300px',
  },
  titleItem: {
    fontFamily: 'Oxanium',
    fontSize: '2em',
    paddingTop: '0.5em',
    paddingLeft: '0.5em',
    color: 'white',
    textShadow: '0.1em 0.1em 0.1em black',
  },
  media: {
    minHeight: 220,
    width: '100%',
  },
  icon: {
    maxWidth: 50,
  },
  card: {
    height: 'auto',
  },
  grid: {
    margin: 'auto',
  },
}));

export default styles;
