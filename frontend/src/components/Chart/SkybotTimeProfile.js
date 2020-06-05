import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';
import moment from 'moment';

function SkybotTimeProfile() {
  const [requestsData, setRequestsData] = useState([]);
  const [loadData, setLoadData] = useState([]);
  const [rows, setRows] = useState([{ x: 0, y: 0 }]);

  useEffect(() => {
    const parsedValueRequests = Papa.parse(requests, {
      header: true,
    }).data;

    const parsedValueLoadData = Papa.parse(loaddata, {
      header: true,
    }).data;

    setRequestsData(parsedValueRequests);
    setLoadData(parsedValueLoadData);
  }, []);

  const getHoverTemplate = (row) => {
    return `
      </br>Exposure: ${row.exposure}
      </br>Positions: ${row.positions}
      </br>Start: ${moment(row.start).format('L LTS')}
      </br>Finish: ${moment(row.finish).format('L LTS')}
      </br>Duration: ${moment
        .utc(row.execution_time * 1000)
        .format('HH:mm:ss')}`;
  };

  // useEffect(() => {
  //   if (requestsData.length > 0) {
  //     let y = 0;
  //     const r = [];
  //     let showLegend = true;
  //     requestsData.forEach(requestsRow => {
  //       loadData.forEach(loadDataRow => {

  //         if (requestsRow.exposure === loadDataRow.exposure) {
  //           y++;
  //           r.push({
  //             type: "scatter",
  //             mode: "lines+markers",
  //             name: "Requests",
  //             line: {
  //               color: "#0B6A22"
  //             },
  //             duration: requestsRow.execution_time,
  //             x: [requestsRow.start, requestsRow.finish],
  //             y: [y, y],
  //             showlegend: showLegend,
  //             legendgroup: "Requests",
  //             hovertemplate: getHoverTemplate(requestsRow)
  //           });

  //           r.push({
  //             type: "scatter",
  //             mode: "lines+markers",
  //             name: "Load Data",
  //             line: {
  //               color: "#0C7FCA"
  //             },
  //             duration: requestsRow.execution_time,
  //             x: [loadDataRow.start, loadDataRow.finish],
  //             y: [y, y],
  //             showlegend: showLegend,
  //             legendgroup: "Load Data",
  //             hovertemplate: getHoverTemplate(loadDataRow)
  //           });
  //           showLegend = false;
  //         }
  //       });
  //     });

  //     setRows(r);
  //   }
  // }, [requestsData, loadData]);

  useEffect(() => {
    if (requestsData.length > 0) {
      let y = 0;
      const r = [];
      let showLegend = true;
      requestsData.forEach((requestsRow) => {
        y++;

        const { exposure } = requestsRow;

        const currentLoadData = loadData.filter(
          (row) => row.exposure === exposure
        )[0];

        r.push({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Requests',
          line: {
            color: '#0B6A22',
          },
          duration: requestsRow.execution_time,
          x: [requestsRow.start, requestsRow.finish],
          y: [y, y],
          showlegend: showLegend,
          legendgroup: 'Requests',
          hovertemplate: getHoverTemplate(requestsRow),
        });

        r.push({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Load Data',
          line: {
            color: '#0C7FCA',
          },
          duration: currentLoadData.execution_time,
          x: [currentLoadData.start, currentLoadData.finish],
          y: [y, y],
          showlegend: showLegend,
          legendgroup: 'Load Data',
          hovertemplate: getHoverTemplate(currentLoadData),
        });

        showLegend = false;
      });
      setRows(r);
    }
  }, [requestsData, loadData]);

  return (
    <Plot
      style={{
        width: '100%',
      }}
      data={rows}
      layout={{
        // width: 400,
        // height: 400,
        xaxis: {
          automargin: true,
          autorange: true,
        },
        yaxis: {
          automargin: true,
          autorange: true,
          showticklabels: false,
        },
        hovermode: 'closest',
        autosize: true,
      }}
      config={{
        scrollZoom: false,
        displaylogo: false,
        responsive: true,
      }}
    />
  );
}

export default SkybotTimeProfile;
