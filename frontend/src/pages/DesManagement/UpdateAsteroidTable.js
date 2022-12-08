import React from 'react'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { useQuery } from 'react-query'
import { updateAsteroidTable, countAsteroidTable } from '../../services/api/Asteroid'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

const DisplayCount = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  width: '200px'
}))

function UpdateAsteroidTable() {
  const { data: resUpdate, status, refetch } = useQuery('updateAsteroidTable', updateAsteroidTable, { enabled: false })

  function handleClickUpdateAsteroidTable() {
    refetch()
  }

  return (
    <Card>
      <CardHeader title='Update Asteroid Table' />
      <CardContent>
        <div>
          <Stack direction='row' spacing={2}>
            {resUpdate && (
              <>
                <DisplayCount>
                  <Typography variant='h4'>{resUpdate.data.count_after}</Typography>
                  <Typography variant='body2'>Total de Asteroids</Typography>
                </DisplayCount>              
                <DisplayCount>
                  <Typography variant='h4'>{resUpdate.data.count_before}</Typography>
                  <Typography variant='body2'>Asteroids antes do Update</Typography>
                </DisplayCount>
                <DisplayCount>
                  <Typography variant='h4'>{resUpdate.data.new_asteroids}</Typography>
                  <Typography variant='body2'>Novos Asteroids</Typography>
                </DisplayCount>
              </>
            )}
          </Stack>
        </div>
        <br />
        <Typography variant='body1'>
          Faz um Insert/Update na tabela TNO_ASTEROIDS com base nos resultados do Skybot Discory, Utiliza a tabela DES_SKYBOT_POSITIONS como
          base para incluir apenas Asteroids que possuem posições no DES.
          <br />
          <br />
          O Update da tabela de Asteroids é executado automaticamente a cada execução do Skybot Discovery.
          <br />
          <br />
          Mas pode ser executado manualmente a qualquer momento sem Impacto nos resultados.
        </Typography>
        <br />
        <LoadingButton size='Large' onClick={handleClickUpdateAsteroidTable} loading={status === 'loading'} variant='contained'>
          Update Asteroid Table
        </LoadingButton>
      </CardContent>
    </Card>
  )
}

export default UpdateAsteroidTable
