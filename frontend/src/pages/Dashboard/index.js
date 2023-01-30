import React from 'react'
import Tabs from '../../components/Tabs'
import Summary from './Summary'
import Skybot from './Skybot'

function Dashboard() {
  const tabs = [
    {
      title: 'Process Summary',
      content: <Summary />
    },
    {
      title: 'Discovery',
      content: <Skybot />
    }
  ]

  return <Tabs data={tabs} />
}

export default Dashboard
