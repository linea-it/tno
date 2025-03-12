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
    return coordinates
  }

  // acessando lat lon dos pntos centrais de 60 passos
  let pointsCoordinates = []

  for (let i = 0; i < params.centralPathSteps.length; i++) {
    const latCenter = params.centralPathSteps[i][0]
    const lonCenter = params.centralPathSteps[i][1]
    const radius = 10000 // 1000 meters
    const numSegments = 36

    const newCircleCoordinates = [generateCircle(latCenter, lonCenter, radius, numSegments)]
    pointsCoordinates.push(...newCircleCoordinates)
  }

  // gera coordenadas para desenhar o ponto central
  const latCenter = params.mapCenter[0]
  const lonCenter = params.mapCenter[1]
  const radius = params.diameter != null ? params.diameter : 30000 // 1000 meters
  const numSegments = 36

  const centralPointCoordinates = [generateCircle(latCenter, lonCenter, radius, numSegments)]

  // função que gera o kml
  const handleDownload = () => {
    // Construindo as partes iniciais do KML
    let contentString = "<?xml version='1.0' encoding='UTF-8'?>"
    contentString += "<kml xmlns='http://www.opengis.net/kml/2.2'> <Document>\n"
    contentString += '<name></name>\n'

    const styles = [
      { id: 'Uncertainty', lineColor: 'ff2f2fd3', width: 1, polyColor: '' },
      { id: 'Center', lineColor: 'ff8d4600', width: 3, polyColor: 'ff8d4600' },
      { id: 'Other', lineColor: 'ffbbbbff', width: 1, polyColor: 'ffbbbbff' },
      { id: 'Body', lineColor: 'ff8d4600', width: 2, polyColor: 'ff8d4600' }
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

    // Dados e coordenadas para as diferentes partes do plot
    const sections = [
      { name: 'Shadow Central Path', style: '#Center', coordinates: params.lineCenter },
      { name: 'Body Size Upper Limit', style: '#Body', coordinates: params.bodyUpper },
      { name: 'Body Size Lower Limit', style: '#Body', coordinates: params.bodyLower },
      { name: 'Uncertainty Upper Limit', style: '#Uncertainty', coordinates: params.uncertaintyUpper },
      { name: 'Uncertainty Lower Limit', style: '#Uncertainty', coordinates: params.uncertaintyLower }
    ]
    // adiciona os estilos e coordenadas no plot
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

    //plota o ponto central
    contentString += '<Placemark>\n'
    contentString += '<name>CA Instant</name>\n'
    contentString += '<Style>\n'
    contentString += '<LineStyle>\n'
    contentString += '  <color>ff8d4600</color>\n'
    contentString += '  <width>36</width>\n'
    contentString += '</LineStyle>\n'
    contentString += '  </Style>\n'
    contentString += '  <LineString>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<coordinates>\n'
    let myArrayC = centralPointCoordinates[0]
    for (let i = 0; i < myArrayC.length; i++) {
      contentString += myArrayC[i] + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '  </LineString>\n'
    contentString += '</Placemark>\n'

    // plota os pontos menores
    for (let c = 0; c < pointsCoordinates.length; c++) {
      let myArrayC = pointsCoordinates[c]
      contentString += '<Placemark>\n'
      contentString += '<name>60 sec step</name>\n'
      contentString += '<Style>\n'
      contentString += '<LineStyle>\n'
      contentString += '  <color>ff8d4600</color>\n'
      contentString += '  <width>16</width>\n'
      contentString += '</LineStyle>\n'
      contentString += '  </Style>\n'
      contentString += '  <LineString>\n'
      contentString += '<tessellate>1</tessellate>\n'
      contentString += '<coordinates>\n'
      for (let i = 0; i < myArrayC.length; i++) {
        contentString += myArrayC[i] + ',0.0\n'
        // console.log(myArrayC[i])
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

  // console.log('params.warning', params.warning)

  return (
    <Button
      variant='contained'
      color='secondary'
      onClick={handleDownload}
      disabled={params.warning !== null} // Enable if params.warning is undefined
    >
      Download KMZ
    </Button>
  )
}

export default DownloadKMZButton
