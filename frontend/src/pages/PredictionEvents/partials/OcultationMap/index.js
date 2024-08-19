import React, {useEffect, useState, useRef} from 'react'
import L, { polyline } from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, useMap, useMapEvents } from 'react-leaflet'
import sun from './data/img/sun.png'
import star from './data/img/estrela-pontiaguda.png'
import styles from './map.module.css'
//import styles from './styles'
import './leaflet.css'
import lat from './data/lat_lon2copy.js'
import lat3 from './data/lat_lon3.js';
import lat1_1 from './data/lat_lon1copy.js';
import tracejada_1 from './data/tracejada1.js';
import tracejada_2 from './data/tracejada2.js';
import { Button } from '@mui/material';
//import { useReactToPrint } from 'react-to-print';
import { Box, Card } from '@mui/material'
import 'leaflet-easyprint'
import generatePDF, { Resolution, Margin } from 'react-to-pdf'
import { getOccultationById, getStarByOccultationId } from '../../../../services/api/Occultation'
//import PredictionEventDetailPrint from '../../DetailPrint'
import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';

const OcultationMap = ({ occultationId }) => {

 const [latt, setLatt] = useState([])
 const [occultation, setOccultation] = useState({})
 
  useEffect(() => {
    getOccultationById({ id : occultationId }).then((res) => {
      setLatt({
        ...res
      })
    })
  }, [])

  const datain = occultationId //"Ola" //occultationId?.occultationId?.occ_path_coeff?.min_latitude
  console.log('datain', datain)

  // ponto central de plot do mapa
    let state = {
        lat: -20.1789, //latt[0]?.min_latitude, //latsin[0], //, //lat[0][0],
        lgt: 20.6435, //lat[9999][0],
        zoom: 2.1
    }

    // posicao central do mapa
    const position = [state.lat, state.lgt]

    const latSun = [40.1789, 48.6435]
    const latStar = [-60.1789, 18.6435]
        
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

    // print do mapa
    /*
    const contentToPrint = useRef(null);
    const handlePrint = useReactToPrint({
      documentTitle: "Print This Document",
      onBeforePrint: () => console.log("before printing..."),
      onAfterPrint: () => console.log("after printing..."),
      removeAfterPrint: true,
    });
  //const print = () => window.print();
    //*/
    /*
    const [Zoom, setZoom] = useState(9);

    console.log(Zoom);

    const MapEvents = () => {
      useMapEvents({
        zoomend() { // zoom event (when zoom animation ended)
          const zoom = map.getZoom(); // get current Zoom of map
          setZoom(zoom);
        },
      });
      return false;
    };*/

    /// Pega as dimensões do mapa e do zoom
    function MyComponent() {
      const map = useMapEvents({
        click: () => {
          map.locate()
          //map.setView([50.5, 30.5], map.getZoom())
          map.setView(position, map.getZoom())
        },
        locationfound: (location) => {
          console.log('location found:', location)
        },
      })
      return null
    }
    ///
    const componentRef = useRef();
    // gera pdf do mapa 
    const personalização = {
      filename: "./advanced-example.pdf",
      method: 'open',
      page: {
        // margin is in MM, default is Margin.NONE = 0
        margin: Margin.SMALL,
        // default is 'A4'
        format: 'A4',
        // default is 'portrait'
        orientation: 'landscape',
     },
     canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: 'image/png',
      qualityRatio: 1
   },
    }
    const conteudoParaPdf = () => document.getElementById('content-id')
    //

    // leaflet.easyprint = dont work
    /*const PrintControl = () => {
      const map = useMap();
    
      useEffect(() => {
        if (!map) return;
    
        const printPlugin =  L.easyPrint({
          title: 'Imprimir Mapa',
          position: 'topright',
          exportOnly: true,
          hideControlContainer: false
        //}).addTo(map);
        }).addTo(map);
    
        return () => {
          map.removeControl(printPlugin);
        };
      }, [map]);
    
      return null;
    }*/

  return (
    <Card className={styles.mapPrint} spacing={4}>
    <Box ref={componentRef} id='content-id'>
      {latt?.occ_path_coeff !== undefined && (
        console.log(latt?.occ_path_coeff.max_latitude, lat[0]),
        <MapContainer  
          className={styles.map} 
          center={[latt?.occ_path_coeff.max_latitude, latt?.occ_path_coeff.max_longitude]} 
          zoom={state.zoom}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
          <MyComponent />
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
        {occultationId !== undefined &&
        <Marker position={[latt?.occ_path_coeff.min_latitude, latt?.occ_path_coeff.max_latitude]} icon={starIcon}>
          <Popup>
          I am a star {datain}
          </Popup>
        </Marker>
        }
        <Marker position={latSun} icon={sunIcon}>
          <Popup>
          I am a sun
          </Popup>
        </Marker>
        <Circle center={position} pathOptions={circle1Options} radius={200000}  />
      </MapContainer>
      )}
      <Box>
          <button onClick={() => generatePDF(conteudoParaPdf, personalização)}>Gerar pdf</button>
          <button onClick={() => exportComponentAsPNG(componentRef)}>
            Export As PNG
          </button>
      </Box>
      </Box>
      </Card> 
  )
}

export default OcultationMap