import React, {useEffect, useState} from 'react'
import L, { polyline } from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle } from 'react-leaflet'
//import { MapContainer } from 'https://cdn.esm.sh/react-leaflet/MapContainer'
import { Box } from '../../../node_modules/@mui/material/index'
import sun from './data/img/sun.png'
import star from './data/img/estrela-pontiaguda.png'
//import './leaflet.css'
//import './App.css'
import styles from './map.module.css'
import './leaflet.css'
import lat from './data/lat_lon2copy.js'
import lat3 from './data/lat_lon3.js';
import lat1_1 from './data/lat_lon1copy.js';
import tracejada_1 from './data/tracejada1.js';
import tracejada_2 from './data/tracejada2.js';

const OcultationMap = () => {

    // ponto central de plot do mapa
    const state = {
        lat: -20.1789, //lat[0][0],
        lgt: 20.6435, //lat[9999][0],
        zoom: 2.1
    }

    // posicao central do mapa
    const position = [state.lat, state.lgt]

    const latSun = [40.1789, 48.6435]
    const latStar = [-60.1789, 18.6435]
    
    //console.log(lat[0])
    //console.log(lat[9999])
    //console.log(lat[9999][0])
    console.log(lat[0][30])
    //console.log(lat[30][0])
    
    const newLat = [lat[0],lat[8999]]
    //console.log(newLat)

    // definicao do icone
    const sunIcon = L.icon({
        iconUrl: sun,
        //shadowUrl: leafShadow,
        iconSize:     [38, 38], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76],
        //lat: [-47.1729,-10.0068],
        //lng: [-27.2729,-13.9068],
    })

    // definicao do icone
    const starIcon = L.icon({
        iconUrl: star,
        //shadowUrl: leafShadow,
        iconSize:     [38, 38], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76],
        //lat: [-47.1729,-10.0068],
        //lng: [-27.2729,-13.9068],
    })

    const circle1 = [
        //[51.51, -0.1268]
        [lat[5000]]
    ]
      
    const circle1Options = {
        color: 'black',
        fillColor: 'black',
        opacity: 100,
        //weight: 10
        //radius: 500,
    }
    //console.log(state)

    // propriedades da linha
    const traceOptions = { color: 'red', dashArray: '5, 10' }
    const blueOptions = { color: 'blue' }
    const blackOptions = { color: 'black' }
    const purpleOptions = { color: 'purple' }

  return (
      <MapContainer className={styles.map} center={position} zoom={state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline pathOptions={traceOptions} positions={tracejada_1}>
          <Popup>
            I am a line blue
          </Popup>
        </Polyline>
        <Polyline pathOptions={traceOptions} positions={tracejada_2}>
          <Popup>
            I am a line blue
          </Popup>
        </Polyline>
        <Polyline pathOptions={blackOptions} positions={lat}>
          <Popup>
            I am a line blue
          </Popup>
        </Polyline>
        <Polyline pathOptions={blueOptions} positions={lat1_1}>
          <Popup>
            I am a line blue
          </Popup>
        </Polyline>
        <Polyline pathOptions={blueOptions} positions={lat3}>
          <Popup>
            I am a line yellow
          </Popup>
        </Polyline>
        <Marker position={latStar} icon={starIcon}>
          <Popup>
          I am a star
          </Popup>
        </Marker>
        <Marker position={latSun} icon={sunIcon}>
          <Popup>
          I am a sun
          </Popup>
        </Marker>
        <Circle center={lat[5000]} pathOptions={circle1Options} radius={200000}  />
      </MapContainer>
  )
}

export default OcultationMap