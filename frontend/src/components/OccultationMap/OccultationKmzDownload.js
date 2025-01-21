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
  // gera coordenadas para desenhar os pontos
  function generateCircle(latCenter, lonCenter, radius, numSegments) {
    let coordinates = []
    const earthRadius = 6371000 // Earth's radius in meters

    for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * 2 * Math.PI
      const latOffset = (radius * Math.cos(angle)) / earthRadius
      const lonOffset = (radius * Math.sin(angle)) / (earthRadius * Math.cos((latCenter * Math.PI) / 180))

      const lat = latCenter + (latOffset * 180) / Math.PI
      const lon = lonCenter + (lonOffset * 180) / Math.PI
      //coordinates.push(`${lon},${lat},0`)
      coordinates.push(`${lon},${lat}`)
    }
    //console.log('coordinates', coordinates)
    //return coordinates.join(' ')
    return coordinates
  }

  // acessando lat lon dos pntos centrais de 60 passos
  let circleCoordinates = []

  for (let i = 0; i < params.centralPathSteps.length; i++) {
    // Example usage //, pontos  menores
    const latCenter = params.centralPathSteps[i][0]
    const lonCenter = params.centralPathSteps[i][1]
    //console.log('lat', latCenter, 'lon', lonCenter)
    const radius = 20000 // 1000 meters
    const numSegments = 36

    //const circleCoordinates = generateCircle(latCenter, lonCenter, radius, numSegments)
    const newCircleCoordinates = [generateCircle(latCenter, lonCenter, radius, numSegments)]
    //console.log('newcircleCoordinates', newCircleCoordinates)
    circleCoordinates.push(...newCircleCoordinates)
  }
  //console.log('circleCoordinates', circleCoordinates) //.length)

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
    ]

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
          contentString += `${coord.reverse()},0.0\n`
        })
        contentString += '</coordinates>\n'
        contentString += '</LineString>\n'
        contentString += '</Placemark>\n'
      }
    })

    // pontos menores
    for (let c = 0; c < circleCoordinates.length; c++) {
      //console.log('contentstring', circleCoordinates[c])
      let myArrayC = circleCoordinates[c]
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
        contentString += myArrayC[i] + ',0.0\n' //[i]
      }
      contentString += '</coordinates>\n'
      contentString += '  </LineString>\n'
      contentString += '</Placemark>\n'
    }

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
