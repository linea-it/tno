import React from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Button from '@mui/material/Button'

// função que gera o kmz
const generateKMZ = (contentString, fileName) => {
  // Initialize JSZip
  const zip = new JSZip()

  // Add the KML content to the ZIP file
  zip.file('doc.kml', contentString)

  // Generate the KMZ (ZIP) file
  zip.generateAsync({ type: 'blob' }).then((kmzBlob) => {
    // Trigger download
    saveAs(kmzBlob, fileName)
  })
}

const DownloadKMZButton = ({ id, ...params }) => {
  // gera coordenadas para desenhar pontos centrais de 60 passos
  function generateCircle(latCenter, lonCenter, radius, numSegments) {
    let coordinates = []
    const earthRadius = 6371000 // Earth's radius in meters

    for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * 2 * Math.PI
      const latOffset = (radius * Math.cos(angle)) / earthRadius
      const lonOffset = (radius * Math.sin(angle)) / (earthRadius * Math.cos((latCenter * Math.PI) / 180))

      const lat = latCenter + (latOffset * 180) / Math.PI
      const lon = lonCenter + (lonOffset * 180) / Math.PI
      coordinates.push(`${lon},${lat}`)
    }
    //console.log('coordinates', coordinates)
    return coordinates
  }

  // acessando lat lon dos pntos centrais de 60 passos
  let pointsCoordinates = []

  for (let i = 0; i < params.centralPathSteps.length; i++) {
    const latCenter = params.centralPathSteps[i][0]
    const lonCenter = params.centralPathSteps[i][1]
    //console.log('lat', latCenter, 'lon', lonCenter)
    const radius = 10000 // 1000 meters
    const numSegments = 36

    const newCircleCoordinates = [generateCircle(latCenter, lonCenter, radius, numSegments)]
    pointsCoordinates.push(...newCircleCoordinates)
    //console.log('pointsCoordinates', pointsCoordinates)
  }

  // gera coordenadas para desenhar o ponto central
  const latCenter = params.mapCenter[0]
  const lonCenter = params.mapCenter[1]
  //console.log('lat', latCenter[0], 'lon', lonCenter[1])
  const radius = params.diameter != null ? params.diameter : 30000 // 1000 meters
  const numSegments = 36

  const centralPointCoordinates = [generateCircle(latCenter, lonCenter, radius, numSegments)]
  //console.log('centralPointCoordinates', centralPointCoordinates)

  // função que gera o kml
  const handleDownload = () => {
    // Construindo as partes iniciais do KML
    let contentString = "<?xml version='1.0' encoding='UTF-8'?>"
    contentString += "<kml xmlns='http://www.opengis.net/kml/2.2'> <Document>\n"
    contentString += '<name></name>\n'

    const styles = [
      { id: 'Rings', lineColor: 'ff999999', width: 3, polyColor: '' },
      { id: 'Center', lineColor: 'ff0000ff', width: 3, polyColor: 'ff00ff00' },
      { id: 'Other', lineColor: 'ffbbbbff', width: 1, polyColor: 'ffbbbbff' },
      { id: 'Body', lineColor: 'ff00ff00', width: 3, polyColor: 'ff00ff00' }
      // { id: 'Points', lineColor: 'ff0000ff', width: 28, polyColor: 'ff0000ff' },
      // { id: 'CentralPoint', lineColor: 'ff0000ff', width: 48, polyColor: ' ' }
    ]

    // Adicionando os estilos dinamicamente
    styles.forEach(({ id, lineColor, width, polyColor }) => {
      contentString += `<Style id='${id}'>\n`
      contentString += '<LineStyle>\n'
      contentString += `<color>${lineColor}</color>\n`
      contentString += `<width>${width}</width>\n`
      contentString += '</LineStyle>\n'
      contentString += '<PolyStyle>\n'
      if (polyColor) {
        contentString += `<color>${polyColor}</color>\n`
      }
      contentString += '</PolyStyle>\n'
      contentString += '</Style>\n'
    })

    // Dados para as diferentes partes
    const sections = [
      { name: 'Center of shadow', style: '#Center', coordinates: params.lineCenter },
      { name: 'Body shadow limit Upper', style: '#Body', coordinates: params.bodyUpper },
      { name: 'Body shadow limit Lower', style: '#Body', coordinates: params.bodyLower },
      { name: 'Uncertainty Upper', style: '#Rings', coordinates: params.uncertaintyUpper },
      { name: 'Uncertainty Lower', style: '#Rings', coordinates: params.uncertaintyLower }
      // //{ name: 'Points', style: '#Points', coordinates: pointsCoordinates },
      // ...pointsCoordinates.map((coords, index) => ({
      //   name: `Points ${index + 1}`,
      //   style: '#Points',
      //   coordinates: coords
      // })),
      //{ name: 'Central Point', style: '#CentralPoint', coordinates: centralPointCoordinates }
    ]

    // console.log(params.lineCenter.reverse())
    // console.log(centralPointCoordinates.reverse())
    // Adicionando as seções dinamicamente
    sections.forEach(({ name, style, coordinates }) => {
      if (coordinates?.length) {
        contentString += '<Placemark>\n'
        contentString += `<name>${name}</name>\n`
        contentString += `<styleUrl>${style}</styleUrl>\n`
        contentString += '<LineString>\n'
        contentString += '<extrude>1</extrude>\n'
        contentString += '<tessellate>1</tessellate>\n'
        contentString += '<altitudeMode>absolute</altitudeMode>\n'
        contentString += '<coordinates>\n'
        coordinates.forEach((coord) => {
          //  if (name === 'Central Point') {
          //   console.log(coord)
          // }
          contentString += `${coord.reverse()},0.0\n`
        })
        contentString += '</coordinates>\n'
        contentString += '</LineString>\n'
        contentString += '</Placemark>\n'
      }
    })

    // pontos menores
    for (let c = 0; c < pointsCoordinates.length; c++) {
      //console.log('contentstring', circleCoordinates[c])
      let myArrayC = pointsCoordinates[c]
      contentString += '<Placemark>\n'
      contentString += '<name>Points</name>\n'
      contentString += '<Style>\n'
      //contentString += `<Style id='Points'>\n`
      contentString += '<LineStyle>\n'
      contentString += '  <color>ff0000ff</color>\n'
      contentString += '  <width>28</width>\n'
      contentString += '</LineStyle>\n'
      // contentString += '<PolyStyle>\n'
      // // contentString += '<color>ff007cf5</color>\n'
      // contentString += '<color></color>\n'
      // contentString += '</PolyStyle>\n'
      contentString += '  </Style>\n'
      contentString += '  <LineString>\n'
      contentString += '<tessellate>1</tessellate>\n'
      contentString += '<coordinates>\n'
      for (let i = 0; i < myArrayC.length; i++) {
        //for (let i = 0; i < 30; i++) {
        contentString += myArrayC[i] + ',0.0\n' //[i]
        console.log(myArrayC[i])
      }
      contentString += '</coordinates>\n'
      contentString += '  </LineString>\n'
      contentString += '</Placemark>\n'
    }

    //ponto central
    contentString += '<Placemark>\n'
    contentString += '<name>Central Point</name>\n'
    contentString += '<Style>\n'
    //contentString += `<Style id='Points'>\n`
    contentString += '<LineStyle>\n'
    contentString += '  <color>ff0000ff</color>\n'
    contentString += '  <width>48</width>\n'
    contentString += '</LineStyle>\n'
    // contentString += '<PolyStyle>\n'
    // contentString += '<color>ff007cf5</color>\n'

    // contentString += '</PolyStyle>\n'
    contentString += '  </Style>\n'
    contentString += '  <LineString>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<coordinates>\n'
    let myArrayC = centralPointCoordinates[0]
    //console.log(myArrayC)
    for (let i = 0; i < myArrayC.length; i++) {
      //console.log('myArrayC', myArrayC[i] + ',0.0\n')
      contentString += myArrayC[i] + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '  </LineString>\n'
    contentString += '</Placemark>\n'

    contentString += '</Document> </kml>\n'

    // Nome do arquivo
    const fileName = `${id}_SolarSystem.kmz`
    generateKMZ(contentString, fileName)
  }

  //
  return (
    <Button variant='outlined' onClick={handleDownload} sx={{ padding: '10px', fontSize: '12px', height: '10px' }}>
      Get KMZ
    </Button>
  )
}

export default DownloadKMZButton
