import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { AppBar, Tabs as MuiTabs, Tab, Box } from '@material-ui/core'
import useStyles from './styles'

function a11yProps(i) {
  return {
    id: `wrapped-tab-${i}`,
    'aria-controls': `wrapped-tabpanel-${i}`
  }
}

function Tabs({ data }) {
  const classes = useStyles()
  const [selectedTab, setSelectedTab] = useState(0)

  const handleChangeTab = (e, v) => {
    setSelectedTab(v)
  }

  return (
    <>
      <AppBar position='static' className={classes.appBar}>
        <MuiTabs value={selectedTab} onChange={handleChangeTab} aria-label='tabs'>
          {data.map((tab, i) => (
            <Tab key={tab.title} value={i} label={tab.title} wrapped {...a11yProps(i)} />
          ))}
        </MuiTabs>
      </AppBar>
      {data.map(
        (tab, i) =>
          selectedTab === i && (
            <div
              key={tab.title}
              // role="panel"
              hidden={selectedTab !== i}
              id={`wrapped-panel-${i}`}
              aria-labelledby={`wrapped-tab-${i}`}
            >
              <Box p={3}>{tab.content}</Box>
            </div>
          )
      )}
    </>
  )
}

Tabs.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      content: PropTypes.node
    })
  ).isRequired
}

export default Tabs
