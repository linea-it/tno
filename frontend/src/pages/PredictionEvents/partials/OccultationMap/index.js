import React from 'react'
import { useQuery } from 'react-query'
import L from 'leaflet'
//import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet'
import { MapContainer, TileLayer, Popup, Polyline, Circle, CircleMarker, Marker } from 'react-leaflet'
//import sun from './data/img/sun.png'
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

  let state = {
    //thumbsCard -> mapas menores dos cards grid ,
    //thumbsList -> mapas pequenos das linhas da lista
    //ultima opção se refere à pagina de detalhes
    zoom: thumbsCard === true ? 1 : thumbsList === true ? -1 : 2.6
  }

  // opções do icone do sol -> falta definir posição real
  /*
  const sunIcon = L.icon({
    iconUrl: sun,
    //shadowUrl: leafShadow,
    iconSize: [38, 38], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76]
    //lat: [-47.1729,-10.0068],
    //lng: [-27.2729,-13.9068],
  })*/

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

  /// Pega as dimensões do mapa e do zoom
  /*
  function MyComponent() {
    const map = useMapEvents({
      click: () => {
        map.locate()
        //map.setView([50.5, 30.5], map.getZoom())
        map.setView(position, map.getZoom())
      },
      locationfound: (location) => {
        console.log('location found:', location)
      }
    })
    return null
  }*/

  //arrays das linhas central upper e lower
  let lineDown = [],
    lineCenter = [],
    pointLineCenter = [],
    lineUpper = []

  const latLonSize = data?.uncertainty_lower_limit_latitude.length

  // monta um array [lat, lon] - linhas vermelhas e azul
  for (let i = 0; i < latLonSize; i++) {
    lineUpper[i] = [data?.uncertainty_upper_limit_latitude[i], data?.uncertainty_upper_limit_longitude[i]]
    lineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
    lineDown[i] = [data?.uncertainty_lower_limit_latitude[i], data?.uncertainty_lower_limit_longitude[i]]
  }

  // monta um array [lat, lon] para desenhar os pontos menores
  for (let i = 0; i < latLonSize; i += 64) {
    pointLineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
  }

  // desenha as sombras mas por enquanto está errado
  //const shadow = false //true

  //console.log('dataall', data)

  return (
    <Card spacing={4}>
      <Box>
        {data !== undefined && (
          <MapContainer
            className={thumbsCard === true ? classes.mapThumbsCard : thumbsList === true ? classes.mapThumbsList : classes.map}
            center={lineUpper[637]}
            zoomControl={thumbsList === true ? false : true}
            attributionControl={thumbsList === true ? false : true}
            zoom={thumbsCard === true ? 1 : state.zoom}
          >
            {/*maxBounds={[
              [-90, -360],
              [90, 360]
            ]}
            maxBoundsViscosity={1}*/}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            {/*shadow === true ? (
                <NightRegion
                  //fillColor='#00345c'
                  weight='0.01'
                  color='#001a2e'
                  refreshInterval={6000} // custom refresh rate in milliseconds, default set to 5000ms
                />
              ) : (
                ''
              )*/}

            {/*<MyComponent /> // pega dimensoes do zoom map*/}
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
