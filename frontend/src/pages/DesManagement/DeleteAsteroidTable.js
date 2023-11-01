import React, { useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { useQuery } from 'react-query'
import { clearAsteroidTable } from '../../services/api/Asteroid'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'

function DeleteAsteroidTable() {
  const { status, refetch } = useQuery('clearAsteroidTable', clearAsteroidTable, { enabled: false })

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      // Reseta o Botão
      setChecked(false)
    }
  }, [status])

  function handleClickDeleteAsteroidTable() {
    refetch()
  }

  const [checked, setChecked] = React.useState(false)

  const handleChange = (event) => {
    setChecked(event.target.checked)
  }

  return (
    <Card>
      <CardHeader title='Clear Asteroid Table' />
      <CardContent>
        <br />
        <Typography variant='body1' component='span'>
          Apaga todos os Asteroids e seus resultados do banco de dados. Utilizada principalmente duranto o desenvolvimento dos pipelines ou
          quando se deseja gerar novos resultados.
          <br />
          Isso implica em perder todos os resultados gerados pelas etapas posteriores ao Skybot Discovery que são:
          <ul>
            <li>
              <strong>Orbit Trace:</strong> Cada posição encontrada pelo pipeline é associada a um Asteroid. Todos os registros na tabela
              DES_OBSERVATION serão apagados.
            </li>
            <li>
              <strong>Predict Occultation:</strong> Toda Ocultação encontrada pelo pipeline é associada a um Asteroid. Todos os registros na
              tabela TNO_OCCULTATION serão apagados.
            </li>
          </ul>
          Após está operação será necessário:
          <ul>
            <li>
              <strong>Update Asteroid Table:</strong> Executar o função "Update Asteroid Table" para gerar novamente a lista de Asteroids.
            </li>
            <li>
              <strong>Orbit Trace:</strong> Executar o pipeline "Orbit Trace" para gerar novos registros de Observações na tabela
              DES_OBSERVATION.
            </li>
            <li>
              <strong>Predict Occultation:</strong> Executar o pipeline "Predict Occultation" para gerar novos resultados de Predição de
              Ocultação registrados na tabela TNO_OCCULTATION.
            </li>
          </ul>
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={checked} onChange={handleChange} />}
            label='Li e entendi. Desejo realmente apagar esses resultados.'
          />
        </FormGroup>
        <LoadingButton
          size='large'
          disabled={!checked}
          onClick={handleClickDeleteAsteroidTable}
          loading={status === 'loading'}
          variant='contained'
        >
          DELETE ALL ASTEROIDS
        </LoadingButton>
        {status === 'success' && <Alert severity='success'>Todos os registros foram apagados com sucesso.</Alert>}
        {status === 'error' && <Alert severity='error'>Não foi possivel executar a função "/api/'asteroids/delete_all/".</Alert>}
      </CardContent>
    </Card>
  )
}

export default DeleteAsteroidTable
