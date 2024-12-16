import React from 'react'
import { useQuery } from 'react-query'
import L from 'leaflet'
import { MapContainer, TileLayer, Popup, Polyline, Circle, CircleMarker, Marker } from 'react-leaflet'
import star from './data/img/estrela-pontiaguda.png'
import styles from './styles'
// css do próprio leaflet, sem ele mapa quebra
import './leaflet.css'
import { Box, Card } from '@mui/material'
import { getOccultationPaths } from '../../../../services/api/Occultation'
/// plugin para desenhar as sobras
//import { NightRegion } from 'react-leaflet-night-region'

const PredictOccultationMap = ({ occultationId, thumbsCard, thumbsList }) => {
  const [force, setForce] = React.useState(false)
  const classes = styles()

  const { data } = useQuery({
    queryKey: ['getOccultationPaths', { id: occultationId, force: force }],
    queryFn: getOccultationPaths,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnmount: false,
    refetchOnWindowFocus: false,
    onSuccess: () => {
      if (force === true) setForce(false)
    },
    staleTime: 1 * 60 * 1000
  })

  //thumbsCard -> mapas menores dos cards grid ,
  //thumbsList -> mapas pequenos das linhas da lista
  //ultima opção se refere à pagina de detalhes
  let zoomLevel = thumbsCard ? 1 : thumbsList ? -1 : 2.6

  // opçoes do icone estrela // falta definir posição real
  const starIcon = L.icon({
    iconUrl: star,
    //shadowUrl: leafShadow, //sombra
    iconSize: [18, 18], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76]
    //lat: [-47.1729,-10.0068],
    //lng: [-27.2729,-13.9068],
  })

  // opçoes do ponto central
  const circleOptions = {
    color: 'blue',
    weight: thumbsCard === true ? 10 : thumbsList === true ? 5 : 20,
    radius: thumbsCard === true ? 100 : data?.diameter
  }

  // opçoes dos pontos menores
  const circleMinOptions = {
    color: 'blue',
    stroke: 'false', //'true',
    weight: thumbsCard === true ? 4 : thumbsList === true ? 1 : 8,
    radius: 1 //thumbsCard === true ? 0.0001 : 1
  }

  // opções das linhas
  // linhas vermelhas
  const traceOptions = { color: 'red', weight: '1', dashArray: '5, 10' }
  // linhas azuis
  const blueOptions = { color: 'blue', weight: '1' }

  const latLonSize = data?.uncertainty_lower_limit_latitude.length
  // monta um array [lat, lon] - linhas vermelhas e azul
  const lineUpper = data?.uncertainty_upper_limit_latitude?.map((lat, i) => [lat, data.uncertainty_upper_limit_longitude[i]]) || []
  const lineCenter = data?.central_path_latitude?.map((lat, i) => [lat, data.central_path_longitude[i]]) || []
  const lineDown = data?.uncertainty_lower_limit_latitude?.map((lat, i) => [lat, data.uncertainty_lower_limit_longitude[i]]) || []

  //arrays das linhas central
  let pointLineCenter = []

  // monta um array [lat, lon] para desenhar os pontos menores
  for (let i = 0; i < latLonSize; i += 64) {
    pointLineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
  }

  return (
    <Card spacing={4}>
      <Box>
        {data !== undefined && (
          <MapContainer
            className={thumbsCard === true ? classes.mapThumbsCard : thumbsList === true ? classes.mapThumbsList : classes.map}
            center={lineUpper[637]}
            zoomControl={thumbsList === true ? false : true}
            attributionControl={thumbsList === true ? false : true}
            zoom={zoomLevel}
          >
            <TileLayer
              url={`https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en&gl=US&${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />

            <Polyline pathOptions={traceOptions} positions={lineUpper}></Polyline>
            <Polyline pathOptions={blueOptions} positions={lineCenter}></Polyline>
            <Polyline pathOptions={traceOptions} positions={lineDown}></Polyline>
            <Marker position={lineCenter[777]} icon={starIcon}>
              <Popup>I am a star </Popup>
            </Marker>
            <Circle center={lineCenter[637]} pathOptions={circleOptions} />
            {pointLineCenter.map((point) => (
              <CircleMarker center={point} pathOptions={circleMinOptions} />
            ))}
          </MapContainer>
        )}
      </Box>
    </Card>
  )
}

export default PredictOccultationMap
