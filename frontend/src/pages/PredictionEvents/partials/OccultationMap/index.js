// Importações principais de bibliotecas necessárias para o funcionamento do componente
import React from 'react'
import { useQuery } from 'react-query' // Hook para gerenciar consultas assíncronas
import L from 'leaflet' // Biblioteca para manipulação de mapas
import { MapContainer, TileLayer, Polyline, Circle, CircleMarker } from 'react-leaflet' // Componentes do React para integração com Leaflet
//import star from './data/img/estrela-pontiaguda.png' // Ícone personalizado
import styles from './styles' // Estilos do componente
import { Box, Card, CircularProgress, Stack, Typography, Button } from '@mui/material' // Componentes de UI do Material-UI
import { getOccultationPaths } from '../../../../services/api/Occultation' // Função para recuperar dados de ocultação
import DayLayer from '../../../../components/OccultationMap/DayTime' // componente que desenha as sombras de acordo com o datetime
import Legend from '../../../../components/OccultationMap/Legend' // componente que desenha as lellglendas dinamicamente
//import FlyToMap from '../../../../components/OccultationMap/FlyToMap' // componennte que move o mapa para posição especificada
import OccultationMapDownload from '../../../../components/OccultationMap/OccultationMapDownload' //componente que faz o download do mapa do sora
import DownloadButton from '../../../../components/OccultationMap/OccultationKmzDownload'

// Função para lidar com descontinuidades em longitude
const splitByDiscontinuity = (points, threshold = 180) => {
  const segments = []
  let currentSegment = []

  for (let i = 0; i < points.length - 1; i++) {
    currentSegment.push(points[i])
    const [lat1, lon1] = points[i]
    const [lat2, lon2] = points[i + 1]

    // Verifica a diferença em longitude para identificar a descontinuidade
    if (Math.abs(lon2 - lon1) > threshold) {
      segments.push(currentSegment) // Adiciona o segmento atual
      currentSegment = [] // Inicia um novo segmento
    }
  }

  // Adiciona o último ponto do último segmento
  if (currentSegment.length > 0) {
    currentSegment.push(points[points.length - 1])
    segments.push(currentSegment)
  }

  return segments
}

// Adiciona periodicidade aos segmentos (linhas)
const createPeriodicSegments = (segments, repetitions = 1) => {
  const periodicSegments = []
  segments.forEach((segment) => {
    for (let i = -repetitions; i <= repetitions; i++) {
      const offsetSegment = segment.map(([lat, lon]) => [lat, lon + i * 360])
      periodicSegments.push(offsetSegment)
    }
  })
  return periodicSegments
}

// Adiciona periodicidade aos pontos
const createPeriodicPoints = (points, repetitions = 1) => {
  const periodicPoints = []
  for (let i = -repetitions; i <= repetitions; i++) {
    points.forEach(([lat, lon]) => {
      periodicPoints.push([lat, lon + i * 360])
    })
  }
  return periodicPoints
}

// Componente principal para exibir o mapa de previsões de ocultação
const PredictOccultationMap = ({ occultationId }) => {
  const [force, setForce] = React.useState(false) // Estado para forçar a atualização dos dados
  const classes = styles() // Estilos aplicados ao mapa

  const tileLayerUrl = `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en&gl=US`

  // Consulta os dados de ocultação usando a API
  const { data, isFetching } = useQuery({
    queryKey: ['getOccultationPaths', { id: occultationId, force }], // Chave única para consulta
    queryFn: getOccultationPaths, // Função que realiza a consulta
    refetchOnWindowFocus: false, // Disable refetching on tab change for this component
    onSuccess: () => setForce(false) // Reseta o estado de força ao concluir
    // staleTime: 60 * 1000 // Define o tempo em milissegundos antes de considerar a consulta desatualizada
  })

  // Define o nível de zoom com base nos parâmetros
  const zoomLevel = 3

  // Determina dinamicamente o centro do mapa e o nível de zoom inicial
  const mapCenterBr = [-15.7801, -47.9292]

  //const mapCenter = data ? [data?.latitude || 0, data?.longitude || 0] : mapCenterBr
  const mapCenter = data ? [data?.latitude || mapCenterBr[0], data?.longitude || mapCenterBr[1]] : mapCenterBr
  const mapZoom = data ? 4 : zoomLevel

  // Configurações do ícone personalizado
  // const starIcon = React.useMemo(
  //   () =>
  //     L.icon({
  //       iconUrl: star, // URL do ícone
  //       iconSize: [18, 18], // Tamanho do ícone
  //       iconAnchor: [22, 94], // Âncora do ícone
  //       popupAnchor: [-3, -76] // Posição do popup relativo ao ícone
  //     }),
  //   [] // Memoriza o ícone para evitar recriação
  // )

  // Configurações dos elementos gráficos do mapa
  const circleOptions = {
    color: '#00468D', // Cor do círculo principal
    stroke: 'false', // Desativa a borda
    weight: 20, // Espessura variável
    radius: data?.diameter === null ? ' ' : data?.diameter // Raio do círculo
  }

  const circleMinOptions = {
    color: '#00468D', // Cor dos círculos menores
    stroke: 'false', // Desativa a borda
    weight: 8, // Espessura variável
    radius: 1 // Raio padrão
  }

  const traceOptions = { color: '#D32F2F', weight: 1, dashArray: '15, 10' } // Opções para linhas tracejadas
  const blueOptions = { color: '#00468D', weight: 1 } // Opções para linhas sólidas
  const bodyOptions = { color: '#00468D', weight: 2 } // Opções para linhas de limite do corpo

  // Extração dos dados para construção dos elementos do mapa
  const warning = data?.warning
  console.log(warning)
  const lineCenter = data?.central_path_latitude?.map((lat, i) => [lat, data?.central_path_longitude[i]]) || []
  const centralPathSteps = data?.central_path_latitude_60s_step?.map((lat, i) => [lat, data?.central_path_longitude_60s_step[i]]) || []
  const bodyUpper = data?.body_upper_limit_latitude?.map((lat, i) => [lat, data?.body_upper_limit_longitude[i]]) || []
  const bodyLower = data?.body_lower_limit_latitude?.map((lat, i) => [lat, data?.body_lower_limit_longitude[i]]) || []
  const uncertaintyUpper = data?.uncertainty_upper_limit_latitude?.map((lat, i) => [lat, data?.uncertainty_upper_limit_longitude[i]]) || []
  const uncertaintyLower = data?.uncertainty_lower_limit_latitude?.map((lat, i) => [lat, data?.uncertainty_lower_limit_longitude[i]]) || []

  // Divide os dados em segmentos para evitar descontinuidades
  const lineCenterSegments = splitByDiscontinuity(lineCenter)
  const bodyUpperSegments = splitByDiscontinuity(bodyUpper)
  const bodyLowerSegments = splitByDiscontinuity(bodyLower)
  const uncertaintyUpperSegments = splitByDiscontinuity(uncertaintyUpper)
  const uncertaintyLowerSegments = splitByDiscontinuity(uncertaintyLower)

  // Aplica periodicidade nos segmentos
  const periodicLineCenterSegments = createPeriodicSegments(lineCenterSegments, 2) // 2 repetições para cada lado
  const periodicBodyUpperSegments = createPeriodicSegments(bodyUpperSegments, 2)
  const periodicBodyLowerSegments = createPeriodicSegments(bodyLowerSegments, 2)
  const periodicUncertaintyUpperSegments = createPeriodicSegments(uncertaintyUpperSegments, 2)
  const periodicUncertaintyLowerSegments = createPeriodicSegments(uncertaintyLowerSegments, 2)

  // Aplica periodicidade nos pontos
  const periodicCentralPathSteps = createPeriodicPoints(centralPathSteps, 2)

  // Verifica se os segmentos existem
  const hasBodyLimit = bodyUpperSegments.length > 0 || bodyLowerSegments.length > 0
  const hasUncertainty = uncertaintyUpperSegments.length > 0 || uncertaintyLowerSegments.length > 0

  //define o time para desenhar as sombras
  const datetimeString = data?.datetime === undefined ? '' : data?.datetime //'2024-07-21T18:44:08Z' //data?.datetime === undefined ? '' : data?.datetime //'2024-01-21T18:44:08Z' //
  const datetime = new Date(datetimeString).getTime()

  return (
    <Card spacing={4}>
      <Box>
        {isFetching && (
          <Box
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            height='200px'
            bgcolor='#f3f4f6'
            borderRadius='8px'
            boxShadow='0 4px 10px rgba(0, 0, 0, 0.1)'
          >
            <CircularProgress size={50} style={{ marginBottom: '16px' }} />
            <Typography variant='subtitle1' color='textSecondary'>
              Loading, please wait...
            </Typography>
          </Box>
        )}
        {!isFetching && mapCenter && (
          <MapContainer className={classes.map} center={mapCenter} zoom={zoomLevel}>
            <TileLayer url={tileLayerUrl} subdomains={['mt0', 'mt1', 'mt2', 'mt3']} />
            {/* <FlyToMap center={mapCenter} zoom={mapZoom} /> */}

            {/* Chamada do Componente que desenha as sombras */}
            <DayLayer datetime={datetime} />

            <Legend hasBodyLimit={hasBodyLimit} hasUncertainty={hasUncertainty} warning={warning} />

            {/* Linha principal do caminho central */}
            {periodicLineCenterSegments.map((segment, index) => (
              <Polyline key={index} pathOptions={blueOptions} positions={segment} />
            ))}

            {/* Pontos do caminho central */}
            {periodicCentralPathSteps.map((point, index) => (
              <CircleMarker key={index} center={point} pathOptions={circleMinOptions} />
            ))}

            {!mapCenterBr && <Circle center={mapCenter} pathOptions={circleOptions} />}

            {/* Limites superiores e inferiores do corpo */}
            {periodicBodyUpperSegments.map((segment, index) => (
              <Polyline key={`upper-${index}`} pathOptions={bodyOptions} positions={segment} />
            ))}
            {periodicBodyLowerSegments.map((segment, index) => (
              <Polyline key={`lower-${index}`} pathOptions={bodyOptions} positions={segment} />
            ))}

            {/* Limites de incerteza */}
            {periodicUncertaintyUpperSegments.map((segment, index) => (
              <Polyline key={`uncertainty-upper-${index}`} pathOptions={traceOptions} positions={segment} />
            ))}
            {periodicUncertaintyLowerSegments.map((segment, index) => (
              <Polyline key={`uncertainty-lower-${index}`} pathOptions={traceOptions} positions={segment} />
            ))}
          </MapContainer>
        )}
        {/* Contêiner dos botões de download */}
        {!isFetching && mapCenter && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px'
            }}
          >
            {/* Botão de Download do arquivo KMZ */}
            <Stack sx={{ flex: 1, mx: 0.5, maxWidth: { xs: '100%', sm: '200px' }, alignSelf: 'stretch' }}>
              <DownloadButton
                {...{
                  id: occultationId,
                  mapCenter,
                  diameter: data?.diameter,
                  lineCenter: lineCenter,
                  centralPathSteps: centralPathSteps,
                  bodyUpper: bodyUpper,
                  bodyLower: bodyLower,
                  uncertaintyUpper: uncertaintyUpper,
                  uncertaintyLower: uncertaintyLower
                }}
              />
            </Stack>

            {/* Botão de Download do mapa no formato do Sora */}
            <Stack sx={{ flex: 1, mx: 0.5, maxWidth: { xs: '100%', sm: '200px' }, alignSelf: 'stretch' }}>
              <OccultationMapDownload occultationId={occultationId} />
            </Stack>
          </Box>
        )}
      </Box>
    </Card>
  )
}

export default PredictOccultationMap
