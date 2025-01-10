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
  //console.log('params', params.uncertaintyLower)
  const handleDownload = () => {
    // construindo kml com o desenho das linhas e coordenadas
    let contentString = "<?xml version='1.0' encoding='UTF-8'?>"
    contentString += "<kml xmlns='http://www.opengis.net/kml/2.2'> <Document>\n"
    contentString += '<name>\n'
    //contentString += objname + "_" + dateocc + "_" + ephem + "_LuckyStar\n";
    contentString += '</name>\n'
    contentString += "<Style id='Rings'>\n"
    contentString += '<LineStyle>\n'
    contentString += '<color>ff999999</color>\n'
    contentString += '<width>3</width>\n'
    contentString += '</LineStyle>\n'
    contentString += '<PolyStyle>\n'
    contentString += '</PolyStyle>\n'
    contentString += '</Style>\n'
    contentString += "<Style id='Center'>\n"
    contentString += '<LineStyle>\n'
    contentString += '<color>ff0000ff</color>\n'
    contentString += '<width>3</width>\n'
    contentString += '</LineStyle>\n'
    contentString += '<PolyStyle>\n'
    contentString += '<color>ff00ff00</color>\n'
    contentString += '</PolyStyle>\n'
    contentString += '</Style>\n'
    contentString += "<Style id='Other'>\n"
    contentString += '<LineStyle>\n'
    contentString += '<color>ffbbbbff</color>\n'
    contentString += '<width>1</width>\n'
    contentString += '</LineStyle>\n'
    contentString += '<PolyStyle>\n'
    contentString += '<color>ffbbbbff</color>\n'
    contentString += '</PolyStyle>\n'
    contentString += '</Style>\n'
    contentString += "<Style id='Body'>\n"
    contentString += '<LineStyle>\n'
    contentString += '<color>ff00ff00</color>\n'
    contentString += '<width>3</width>\n'
    contentString += '</LineStyle>\n'
    contentString += '<PolyStyle>\n'
    contentString += '<color>ff00ff00</color>\n'
    contentString += '</PolyStyle>\n'
    contentString += '</Style>\n'

    // Centralite
    //if ( lineCenter.length) {
    contentString += '<Placemark>\n'
    contentString += '<name>Center of shadow</name>\n'
    contentString += '<styleUrl>#Center</styleUrl>\n'
    contentString += '<LineString>\n'
    contentString += '<extrude>1</extrude>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<altitudeMode>absoluto</altitudeMode>\n'
    contentString += '<coordinates>\n'
    let myArrayC = params.lineCenter
    for (let i = 0; i < myArrayC.length; i++) {
      //console.log('buttonC', myArrayC[i])
      contentString += myArrayC[i].reverse() + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '</LineString> </Placemark>\n'
    // //}

    // // Limite Nord
    // //if ( bodyUpper.length) {
    contentString += '<Placemark>\n'
    contentString += '<name>Body shadow limit</name>\n'
    contentString += '<styleUrl>#Body</styleUrl>\n'
    contentString += '<LineString>\n'
    contentString += '<extrude>1</extrude>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<altitudeMode>absoluto</altitudeMode>\n'
    contentString += '<coordinates>\n'
    let myArrayBU = params.bodyUpper
    for (let i = 0; i < myArrayBU.length; i++) {
      //console.log('button', myArrayBU[i])
      contentString += myArrayBU[i].reverse() + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '</LineString> </Placemark>\n'
    // //}

    // // Limite Sud
    // // //if ( bodyLower.length) {
    contentString += '<Placemark>\n'
    contentString += '<name>Body shadow limit</name>\n'
    contentString += '<styleUrl>#Body</styleUrl>\n'
    contentString += '<LineString>\n'
    contentString += '<extrude>1</extrude>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<altitudeMode>absoluto</altitudeMode>\n'
    contentString += '<coordinates>\n'
    let myArrayBL = params.bodyLower
    for (let i = 0; i < myArrayBL.length; i++) {
      //console.log('button', myArrayBL[i])
      contentString += myArrayBL[i].reverse() + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '</LineString> </Placemark>\n'
    // //}

    // // Incertitude
    // //if ( uncertaintyUpper.length) {
    contentString += '<Placemark>\n'
    contentString += '<name>Uncertainty</name>\n'
    contentString += '<styleUrl>#Rings</styleUrl>\n'
    contentString += '<LineString>\n'
    contentString += '<extrude>1</extrude>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<altitudeMode>absoluto</altitudeMode>\n'
    contentString += '<coordinates>\n'
    let myArrayUU = params.uncertaintyUpper
    for (let i = 0; i < myArrayUU.length; i++) {
      //console.log('button', myArrayUP[i])
      contentString += myArrayUU[i].reverse() + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '</LineString> </Placemark>\n'

    // // Incertitude
    // //if ( uncertaintyLower.length) {
    contentString += '<Placemark>\n'
    contentString += '<name>Uncertainty</name>\n'
    contentString += '<styleUrl>#Rings</styleUrl>\n'
    contentString += '<LineString>\n'
    contentString += '<extrude>1</extrude>\n'
    contentString += '<tessellate>1</tessellate>\n'
    contentString += '<altitudeMode>absoluto</altitudeMode>\n'
    contentString += '<coordinates>\n'
    let myArrayUL = params.uncertaintyLower
    for (let i = 0; i < myArrayUL.length; i++) {
      //console.log('button', myArrayUL[i])
      contentString += myArrayUL[i].reverse() + ',0.0\n'
    }
    contentString += '</coordinates>\n'
    contentString += '</LineString> </Placemark>\n'

    //
    // ponto
    // contentString += '<Placemark id="08127040563580DF8956">'
    // contentString += '<name>KMZ Test File</name>'
    // contentString += '<LookAt>'
    // contentString += '	<longitude>-95.26548316128246</longitude>'
    // contentString += '	<latitude>38.95938755218669</latitude>'
    // contentString += '	<altitude>0</altitude>'
    // contentString += '	<heading>2.064875297280124e-08</heading>'
    // contentString += '	<tilt>0</tilt>'
    // contentString += '	<range>11004253.3494367</range>'
    // contentString += '	<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>'
    // contentString += '</LookAt>'
    // contentString += '<styleUrl>#m_ylw-pushpin</styleUrl>'
    // contentString += '<Point>'
    // contentString += '	<gx:drawOrder>1</gx:drawOrder>'
    // contentString += '	<coordinates>'
    // //let myArrayUL = periodicUncertaintyLowerSegments
    // // //console.log(myArrayUL)
    // // for (let i = 0; i < myArrayUL.length; i++) {
    // //   contentString += Number(myArrayUL[i][1]) + ',' + +Number(myArrayUL[i][0]) + ',0\n'
    // // }
    // let myArrayUL = periodicLineCenterSegments
    // for (let i = 0; i < myArrayUL[0].length; i++) {
    //   console.log('button', myArrayUL[0][i])
    //   contentString += myArrayUL[0][i] + ',0\n'
    // }
    // let myArrayUL = uncertaintyLower
    // for (let i = 0; i < myArrayUL.length; i++) {
    //   console.log('button', myArrayUL[i].reverse())
    //   contentString += myArrayUL[i].reverse() + ',0.0\n'
    // }
    // contentString += '	</coordinates>'
    // contentString += '</Point>'
    // contentString += '</Placemark>'
    // ponto

    contentString += '</Document> </kml>\n'

    //console.log('id', id)
    // nome arquivo
    const fileName = id + '_SolarSystem.kmz'
    generateKMZ(contentString, fileName)
  }

  return (
    <Button variant='outlined' onClick={handleDownload} sx={{ padding: '10px', fontSize: '12px', height: '10px' }}>
      Download KMZ
    </Button>
  )
}

export default DownloadKMZButton
