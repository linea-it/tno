import React from 'react'
import Grid from '@mui/material/Grid'
import UpdateAsteroidTable from './UpdateAsteroidTable'
import ClearDesDataPreparation from './ClearDesDataPreparation'
import SubmitSkybotJobs from './SubmitSkybotJobs'

function DesManagement() {
  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={6} lg={4}>
          <ClearDesDataPreparation></ClearDesDataPreparation>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <SubmitSkybotJobs></SubmitSkybotJobs>
        </Grid>
        <Grid item xs={12} md={8} lg={4}>
          <UpdateAsteroidTable></UpdateAsteroidTable>
        </Grid>
      </Grid>
    </>
  )
}

export default DesManagement
