import React from 'react'
import { useQuery } from 'react-query'
import L from 'leaflet'
//import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet'
import { MapContainer, TileLayer, Popup, Polyline, Circle, CircleMarker, Marker } from 'react-leaflet'
//import sun from './data/img/sun.png'
import star from './data/img/estrela-pontiaguda.png'
import styles from './map.module.css'
//import styles from './styles'
import './leaflet.css'
import { Box, Card } from '@mui/material'
import { getOccultationPaths } from '../../../../services/api/Occultation'
//import { circle } from 'leaflet'
import { NightRegion } from 'react-leaflet-night-region'

const PredictOccultationMap = ({ occultationId, ...props }) => {
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

  let state = {
    lat: (data?.min_latitude + data?.max_latitude) / 2, //center.lat, //-20.1789,
    lon: (data?.min_longitude + data?.max_longitude) / 2, //center.lon, //20.6435,
    zoom: 1
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

  const starIcon = L.icon({
    iconUrl: star,
    //shadowUrl: leafShadow,
    iconSize: [18, 18], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76]
    //lat: [-47.1729,-10.0068],
    //lng: [-27.2729,-13.9068],
  })

  const circleOptions = {
    color: 'blue',
    //fillColor: 'blue',
    //opacity: 100
    //stroke: 'false',
    weight: 20
    //radius: 500,
  }
  const circleminOptions = {
    color: 'blue',
    //fillColor: 'blue',
    //opacity: 100
    stroke: 'true',
    weight: 10
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
    pointlineCenter = [],
    lineUpper = []

  const latLonSize = data?.uncertainty_lower_limit_latitude.length

  for (let i = 0; i < latLonSize; i++) {
    lineUpper[i] = [data?.uncertainty_upper_limit_latitude[i], data?.uncertainty_upper_limit_longitude[i]]
    lineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
    lineDown[i] = [data?.uncertainty_lower_limit_latitude[i], data?.uncertainty_lower_limit_longitude[i]]
  }

  for (let i = 0; i < latLonSize; i += 64) {
    pointlineCenter[i] = [data?.central_path_latitude[i], data?.central_path_longitude[i]]
  }

  // desenha as sobras
  const shadow = false //true

  console.log('dataall', data)
  //console.log('pointlinecenter', pointlineCenter)
  //console.log('linecenter', lineCenter)

  return (
    <Card spacing={4}>
      <Box>
        {data !== undefined &&
          (console.log([data?.central_path_latitude[0], data?.central_path_longitude[0]]),
          (
            <MapContainer
              className={styles.map}
              //center={[data?.central_path_latitude[600], data?.central_path_longitude[600]]}
              center={[state.lat, state.lon]}
              zoom={state.zoom}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              {shadow === true ? (
                <NightRegion
                  //fillColor='#00345c'
                  weight='0.01'
                  color='#001a2e'
                  refreshInterval={6000} // custom refresh rate in milliseconds, default set to 5000ms
                />
              ) : (
                ''
              )}

              {/*<MyComponent /> // pega dimensoes do zoom map*/}
              <Polyline pathOptions={traceOptions} positions={lineUpper}></Polyline>
              <Polyline pathOptions={blueOptions} positions={lineCenter}></Polyline>
              <Polyline pathOptions={traceOptions} positions={lineDown}></Polyline>
              {/*console.log('estrela', lineCenter[777]) vertical, horizontal*/}
              <Marker position={[-35.338527765322894, -36.52870116703535]} icon={starIcon}>
                <Popup>I am a star </Popup>
              </Marker>
              <Circle center={lineCenter[637]} pathOptions={circleOptions} radius={data?.diameter} />
              {pointlineCenter.map((point) => (
                <CircleMarker center={point} pathOptions={circleminOptions} radius={1} />
              ))}
            </MapContainer>
          ))}
      </Box>
    </Card>
  )
}

export default PredictOccultationMap
