import React from 'react'
import { useQuery } from 'react-query'
//import L, { polyline } from 'leaflet'
//import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet'
import { MapContainer, TileLayer, Popup, Polyline, Circle } from 'react-leaflet'
//import sun from './data/img/sun.png'
//import star from './data/img/estrela-pontiaguda.png'
import styles from './map.module.css'
//import styles from './styles'
import './leaflet.css'
import { Box, Card } from '@mui/material'
import { getOccultationPaths } from '../../../../services/api/Occultation'

const PredictOccultationMap = ({ occultationId }) => {
  const [force, setForce] = React.useState(false)

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

  // ponto central de plot do mapa
  let state = {
    lat: -20.1789, //latt[0]?.min_latitude, //latsin[0], //, //lat[0][0],
    lgt: 20.6435, //lat[9999][0],
    zoom: 3.1
  }

  // definicao do icone
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

  // definicao do icone
  /*
  const starIcon = L.icon({
    iconUrl: star,
    //shadowUrl: leafShadow,
    iconSize: [38, 38], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76]
    //lat: [-47.1729,-10.0068],
    //lng: [-27.2729,-13.9068],
  })*/

  const circle1Options = {
    color: 'blue',
    fillColor: 'blue',
    //opacity: 100
    weight: 20
    //radius: 500,
  }

  // propriedades da linha
  const traceOptions = { color: 'red', weight: '1', dashArray: '5, 10' }
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
    lineUpper = []

  const latLonSize = data?.uncertainty_lower_limit_latitude.length

  for (let i = 0; i < latLonSize; i++) {
    //console.log(i, data?.uncertainty_lower_limit_latitude[i], data?.uncertainty_lower_limit_longitude[i])
    lineUpper[i] = [data?.uncertainty_upper_limit_latitude[i], data?.uncertainty_upper_limit_longitude[i]]
    lineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
    lineDown[i] = [data?.uncertainty_lower_limit_latitude[i], data?.uncertainty_lower_limit_longitude[i]]
  }

  console.log('dataall', data)
  console.log('linecenter', lineCenter)

  return (
    <Card className={styles.mapPrint} spacing={4}>
      <Box>
        {data !== undefined &&
          (console.log([data?.central_path_latitude[0], data?.central_path_longitude[0]]),
          (
            <MapContainer
              className={styles.map}
              center={[data?.central_path_latitude[600], data?.central_path_longitude[600]]}
              zoom={state.zoom}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              {/*<MyComponent /> // pega dimensoes do zoom map*/}
              <Polyline pathOptions={traceOptions} positions={lineUpper}>
                <Popup>I am a line blue</Popup>
              </Polyline>
              <Polyline pathOptions={blueOptions} positions={lineCenter}>
                <Popup>I am a line blue</Popup>
              </Polyline>
              <Polyline pathOptions={traceOptions} positions={lineDown}>
                <Popup>I am a line yellow</Popup>
              </Polyline>
              <Circle center={lineCenter[600]} pathOptions={circle1Options} radius={60000} />
            </MapContainer>
          ))}
      </Box>
    </Card>
  )
}

export default PredictOccultationMap
