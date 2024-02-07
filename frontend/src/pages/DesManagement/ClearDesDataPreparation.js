import React, { useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { useQuery } from 'react-query'
import { clearDesDataPreparation } from '../../services/api/Skybot'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'

function ClearDesDataPreparation() {
  const { status, refetch } = useQuery('clearDesDataPreparation', clearDesDataPreparation, { enabled: false })

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      // Reseta o Botão
      setChecked(false)
    }
  }, [status])

  function handleClickClearDesDataPreparation() {
    refetch()
  }

  const [checked, setChecked] = React.useState(false)

  const handleChange = (event) => {
    setChecked(event.target.checked)
  }

  return (
    <Card>
      <CardHeader title='Clear Des Data Preparation Tables' />
      <CardContent>
        <br />
        <Typography variant='body1' component='span'>
          Apaga todos os registros das tabelas envolvidas nas etapas de Data Preparation do DES (Skybot e Orbit Trace). Utilizada principalmente duranto o desenvolvimento dos pipelines ou
          quando se deseja gerar novos resultados.
          <br />
          Isso implica em perder todos os resultados gerados pelas etapas Skybot Discovery e Orbit Trace.
          <br />
          As tabelas que serão apagadas são:
          <ul>
            <li>
              <strong>Des Skybot Job:</strong> Histórioco de Jobs do Skybot.
            </li>
            <li>
              <strong>Des Skybot Job Result:</strong> Resumo dos resultado por exposição em cada Job do Skybot.
            </li>
            <li>
              <strong>Des Skybot Position:</strong> Todas as posições retornadas pelo skybot que estão dentro dos ccds do DES.
            </li>
            <li>
              <strong>Skybot Position:</strong> Todas as posições retornadas pelo skybot.
            </li>
            <li>
              <strong>Des Skybot Summary by Dynclass:</strong>
            </li>
            <li>
              <strong>Des Skybot by Dynclass:</strong>
            </li>
            <li>
              <strong>Des Skybot by Year:</strong>
            </li>
            <li>
              <strong>Observation:</strong> Posições encontradas pelo pipeline Orbit Trace.
            </li>
          </ul>
          Após está operação será necessário:
          <ul>
            <li>
              <strong>Skybot Discovery:</strong> Executar o pipeline Skybot Discovery para todo o periodo do DES.
            </li>
            <li>
              <strong>Orbit Trace:</strong> Executar o pipeline "Orbit Trace" para gerar novos registros de Observações na tabela
              DES_OBSERVATION.
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
          onClick={handleClickClearDesDataPreparation}
          loading={status === 'loading'}
          variant='contained'
        >
          DELETE ALL DES DATA PREPARATION
        </LoadingButton>
        {status === 'success' && <Alert severity='success'>Todos os registros foram apagados com sucesso.</Alert>}
        {status === 'error' && <Alert severity='error'>Não foi possivel executar a função "/api/des/clear_des_data_preparation_tables/".</Alert>}
      </CardContent>
    </Card>
  )
}

export default ClearDesDataPreparation
