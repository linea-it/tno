import React, { useEffect } from 'react';
import Tabs from '../../components/Tabs';
import Summary from './Summary';
import Skybot from './Skybot';
import { useTitle } from '../../contexts/title';

function Dashboard() {
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('Dashboard');
  }, []);

  const tabs = [
    {
      title: 'Process Summary',
      content: <Summary />,
    },
    {
      title: 'Discovery',
      content: <Skybot />,
    },
  ];

  return <Tabs data={tabs} />;
}

export default Dashboard;
