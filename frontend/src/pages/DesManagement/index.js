import React, { useEffect, useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import LoadingButton from '@mui/lab/LoadingButton';
function DesManagement() {
  const [loading, setLoading] = React.useState(true);
  function handleClick() {
    setLoading(true);
  }

  return (
    <>
      <Grid container spacing={2} alignItems='stretch'>
        <Grid item xs={12} md={4} lg={3}>
          <Grid container direction='column' spacing={2}>
              <Card>
                <CardHeader title='Asteroid Table Actions' />
                <CardContent>
                  <Typography variant='h6'>Asteroids</Typography>
                  <Typography variant='h3'>16000</Typography>
                  <Typography variant='body' color="text.secondary">Total de Asteroids na tabela TNO_ASTEROIDS. </Typography>
                  <br />
                  <br />
                  <Typography variant='h6'>Update Asteroid Table</Typography>

                  <Typography variant='body'>
                    Faz um Insert/Update na tabela TNO_ASTEROIDS com base nos resultados do Skybot Discory, 
                    Utiliza a tabela DES_SKYBOT_POSITIONS como base para incluir apenas Asteroids que possuem posições no DES.
                    <br />
                    <br />
                    O Update da tabela de Asteroids é executado automaticamente a cada execução do Skybot Discovery. 
                    <br />
                    <br />
                    Mas pode ser executado manualmente a qualquer momento sem Impacto nos resultados.
                  </Typography>
                  <LoadingButton
                    size="small"
                    onClick={handleClick}
                    loading={loading}
                    variant="contained"
                  >
                    Update Asteroid Table
                  </LoadingButton>
                  <Divider />                  
                </CardContent>
              </Card>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default DesManagement