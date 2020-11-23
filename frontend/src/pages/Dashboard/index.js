import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '../../components/Tabs';
import Summary from './Summary';
import Skybot from './Skybot';

function Dashboard({ setTitle }) {

  useEffect(() => {
    setTitle('Dashboard');
  }, [setTitle]);

  const tabs = [
    {
      title: 'Summary',
      content: <Summary />
    },
    {
      title: 'Discovery',
      content: <Skybot />
    },
  ]

  return (
    <Tabs data={tabs} />
  );
}

Dashboard.propTypes = {
  setTitle: PropTypes.func.isRequired,
};

export default Dashboard;
