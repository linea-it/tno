import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';
import PropTypes from 'prop-types';

function CustomCardStats({
  title, services, color, icon, size, customServices,
}) {
  const useStyles = makeStyles(({
    card: {
      display: 'flex',
      borderLeft: `4px solid ${color}`,
      position: 'relative',
    },
    // content: {
    //   flex: '1 0 auto',
    // },
    iconCard: {
      position: 'absolute',
      right: 15,
      top: '13%',
      fontSize: 40,
      opacity: 0.42,
      width: 'auto',
      color,
    },
    title: {
      color,
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: 'bold',
    },
    services: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    iconSizeCard: {
      fontSize: 26,
      opacity: 0.12,
      width: 'auto',
      marginRight: 15,
    },
    sizeWrapper: {
      display: 'block',
      marginTop: 5,
    },
    inlineBlock: {
      display: 'inline-block',
      verticalAlign: 'middle',
    },
  }));

  const classes = useStyles();

  return (
    <Card className={clsx(classes.card, classes.cardColor)}>
      <CardContent className={classes.content}>
        <Typography component="h5" variant="h5" className={classes.title}>
          {title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" className={classes.services}>
          {customServices !== null ? customServices() : services}
        </Typography>
        <Icon className={clsx(classes.iconCard, 'fas', icon)} />
        {size !== '' ? (
          <>
            <Divider />
            <div className={classes.sizeWrapper}>
              <Icon className={clsx(classes.iconSizeCard, classes.inlineBlock, 'fas', 'fa-hdd')} />
              <Typography variant="subtitle1" color="textSecondary" className={classes.inlineBlock}>
                {size}
              </Typography>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

CustomCardStats.defaultProps = {
  title: '',
  services: 0,
  color: '',
  icon: '',
  size: '',
  customServices: null,
};

CustomCardStats.propTypes = {
  title: PropTypes.string,
  services: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  color: PropTypes.string,
  icon: PropTypes.string,
  size: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  customServices: PropTypes.func,
};


export default CustomCardStats;
