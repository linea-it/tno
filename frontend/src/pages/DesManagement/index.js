import React from 'react'
import Grid from '@material-ui/core/Grid'
import UpdateAsteroidTable from './UpdateAsteroidTable'
import DeleteAsteroidTable from './DeleteAsteroidTable'
import ClearDesDataPreparation from './ClearDesDataPreparation'

function DesManagement() {
  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={6} lg={4}>
          <ClearDesDataPreparation></ClearDesDataPreparation>
        </Grid>  
        <Grid item xs={12} md={8} lg={4}>
          <UpdateAsteroidTable></UpdateAsteroidTable>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <DeleteAsteroidTable></DeleteAsteroidTable>
        </Grid>
      </Grid>
    </>
  )
}

export default DesManagement
