import React from 'react';
import Banner from '../../../components/LandingPage/Banner';
import Interfaces from './partials/Interfaces';
import Supporters from './partials/Supporters';
import styles from './styles';

function Main() {
  const classes = styles();

  return (
    <>
      <Banner />
      <div className={classes.root}>
        <Interfaces />
        <Supporters />
      </div>
    </>
  );
}

export default Main;
