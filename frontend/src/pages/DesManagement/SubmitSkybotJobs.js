import React, { useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { SubmitSkybotJobsBalanced } from '../../services/api/Skybot'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button';
import useInterval from '../../hooks/useInterval'

function SubmitSkybotJobs() {
  const { data, status, refetch } = useQuery('submitSkybotJobsBalanced', SubmitSkybotJobsBalanced, { enabled: false })
  const navigate = useNavigate()
  const [checked, setChecked] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      // Reseta o Botão
      setChecked(false)
      setOpen(true)
    }
  }, [status])

  function handleClick() {
    refetch()
  }

  const handleChange = (event) => {
    setChecked(event.target.checked)
  }
  const handleCheckJob = () => {
    console.log(data)
    navigate(`/dashboard/data-preparation/des/discovery/${data.data.job}`)
  }
  
  useInterval(() => {
    if (status === 'success' || status === 'error')  {
      setOpen(false)
    }
  }, [15000])

  return (
    <Card>
      <CardHeader title='Skybot Job for all DES Survey' />
      <CardContent>
        <br />
        <Typography variant='body1' component='span'>
          Submete Jobs do Skybot para todo o periodo de observações do DES Survey, Criando uma fila balanceada de jobs.
          <br />
          <ul>
            <li>
              Os jobs estão divididos em blocos de aproximadamente ~5000 exposures.
            </li>
            <li>
              Duração estimada de cada job é de ~3h
            </li>
            <li>
              Algumas informações de estimativa do job só ficaram disponiveis quando o job for iniciado.
            </li>
          </ul>
          Para agilizar os jobs as operações de summary são executadas somente a cada 5 jobs e no ultimo. 
          <br /><br />
          Recomendo apagar todos os dados do DES antes de executar essa operação.
          <br /><br />
          Em caso de erro em um dos Jobs não é necessario rodar o periodo todo novamente apenas o periodo que deu erro. 
          <br /><br />
          Os jobs podem ser acompanhados normalmente na interface Skybot Discovery.
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={checked} onChange={handleChange} />}
            label='Li e entendi.'
          />
        </FormGroup>
        <LoadingButton
          size='large'
          disabled={!checked}
          onClick={handleClick}
          loading={status === 'loading'}
          variant='contained'
        >
          SUBMIT SKYBOT JOBS
        </LoadingButton>
        {open === true && <>
          {status === 'success' && 
          <Alert severity='success' action={
          <Button color="inherit" size="small" onClick={handleCheckJob}>
            Check Job
          </Button>
          }>
            Foram gerados {data.data.count} jobs.</Alert>}
        {status === 'error' && <Alert severity='error'>Não foi possivel executar a função "/api/des/skybot_job/submit_job_balanced_periods/".</Alert>}        
        </>}

      </CardContent>
    </Card>
  )
}

export default SubmitSkybotJobs
