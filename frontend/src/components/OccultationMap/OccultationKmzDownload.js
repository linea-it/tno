import React from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import Button from '@mui/material/Button'

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
      { name: 'Body shadow limit', style: '#Body', coordinates: params.bodyUpper },
      { name: 'Body shadow limit', style: '#Body', coordinates: params.bodyLower },
      { name: 'Uncertainty', style: '#Rings', coordinates: params.uncertaintyUpper },
      { name: 'Uncertainty', style: '#Rings', coordinates: params.uncertaintyLower }
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

    //   //
    //   // ponto
    //   // contentString += '<Placemark id="08127040563580DF8956">'
    //   // contentString += '<name>KMZ Test File</name>'
    //   // contentString += '<LookAt>'
    //   // contentString += '	<longitude>-95.26548316128246</longitude>'
    //   // contentString += '	<latitude>38.95938755218669</latitude>'
    //   // contentString += '	<altitude>0</altitude>'
    //   // contentString += '	<heading>2.064875297280124e-08</heading>'
    //   // contentString += '	<tilt>0</tilt>'
    //   // contentString += '	<range>11004253.3494367</range>'
    //   // contentString += '	<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>'
    //   // contentString += '</LookAt>'
    //   // contentString += '<styleUrl>#m_ylw-pushpin</styleUrl>'
    //   // contentString += '<Point>'
    //   // contentString += '	<gx:drawOrder>1</gx:drawOrder>'
    //   // contentString += '	<coordinates>'
    //   // //let myArrayUL = periodicUncertaintyLowerSegments
    //   // // //console.log(myArrayUL)
    //   // // for (let i = 0; i < myArrayUL.length; i++) {
    //   // //   contentString += Number(myArrayUL[i][1]) + ',' + +Number(myArrayUL[i][0]) + ',0\n'
    //   // // }
    //   // let myArrayUL = periodicLineCenterSegments
    //   // for (let i = 0; i < myArrayUL[0].length; i++) {
    //   //   console.log('button', myArrayUL[0][i])
    //   //   contentString += myArrayUL[0][i] + ',0\n'
    //   // }
    //   // let myArrayUL = uncertaintyLower
    //   // for (let i = 0; i < myArrayUL.length; i++) {
    //   //   console.log('button', myArrayUL[i].reverse())
    //   //   contentString += myArrayUL[i].reverse() + ',0.0\n'
    //   // }
    //   // contentString += '	</coordinates>'
    //   // contentString += '</Point>'
    //   // contentString += '</Placemark>'
    //   // ponto

    contentString += '</Document> </kml>\n'

    // Nome do arquivo
    const fileName = `${id}_SolarSystem.kmz`
    generateKMZ(contentString, fileName)
  }

  //
  return (
    <Button variant='outlined' onClick={handleDownload} sx={{ padding: '10px', fontSize: '12px', height: '10px' }}>
      Download KMZ
    </Button>
  )
}

export default DownloadKMZButton
