import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const colors = [
  '#4D80CC',
  '#009900',
  '#b32d00',
  '#FEBC4F',
  '#996633',
  '#E6331A',
  '#FFFF99',
  '#1AB399',
  '#CC80CC',
  '#00B3E6',
  '#CC9999',
  '#E6B333',
  '#3366E6',
  '#0033CC',
  '#FEBC4F',
  '#B3B31A',
  '#00E680',
  '#4D8066',
  '#E6FF80',
  '#1AFF33',
  '#999933',
  '#FF3380',
  '#CCCC00',
  '#66E64D',
  '#4DB3FF',
  '#FF6633',
  '#CCFF1A',
  '#FF1A66',
  '#E666FF',
  '#6680B3',
  '#E666B3',
  '#99FF99',
  '#B34D4D',
  '#809900',
  '#E6B3B3',
  '#66991A',
  '#FF99E6',
  '#33991A',
  '#999966',
  '#33FFCC',
  '#66994D',
  '#B366CC',
  '#4D8000',
  '#B33300',
  '#66664D',
  '#991AFF',
  '#9900B3',
  '#E64D66',
  '#4DB380',
  '#FF4D4D',
  '#99E6E6',
  '#6666FF',
];

const useStyles = makeStyles((theme) => ({
  plotWrapper: {
    display: 'flex !important',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('lg')]: {
      overflow: 'auto',
    },
  },
  circular_progress: {
    marginTop: "25%",
    marginLeft: "45%",
    marginBottom: "25%",
  }
}));


export function Donut({ data, width, height, loading }) {

  const classes = useStyles();
  const Plot = createPlotlyComponent(Plotly);

  const colors = data.map((el) => el.color);

  const rows = [{
    labels: data.map((el) => el.name),
    values: data.map((el) => el.value),
    marker: {
      colors: colors.length > 0 ? colors : [colors[0], colors[7], colors[2], colors[3], colors[4], colors[20]],
    },
    hole: 0.4,
    type: 'pie',
    textposition: 'inside',
    hoverinfo: 'label+value',
    sort: false,
  }];

  return (
    !loading ?
      <Plot
        data={rows}
        className={classes.plotWrapper}
        layout={{
          width,
          height,
          hovermode: 'closest',
          autosize: true,
        }}
        config={{
          scrollZoom: true,
          displaylogo: false,
          responsive: true,
        }}
      />
      :
      <CircularProgress
        className={classes.circular_progress}
      />
  );
}

Donut.defaultProps = {
  width: 450,
  height: 364,
  loading: false,
};

Donut.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
};


export function TimeProfile({ data, width, height, loading }) {
  const classes = useStyles();
  const Plot = createPlotlyComponent(Plotly);
  const rows = [];

  if (Array.isArray(data)) {
    data.forEach((line, i) => {
      rows.push({
        name: line.name,
        x: [line.points[0].x, line.points[1].x],
        y: [line.points[0].y, line.points[1].y],
        type: i === 0 ? 'line' : 'scatter',
        mode: 'lines+markers',
        marker: {
          color: colors[0],
        },
        line: {
          color: colors[0],
        },
        duration: line.duration,
        showlegend: false,
        hoverinfo: 'name+duration',
      });
    });
  } else if (typeof data === 'object' && !Array.isArray(data)) {
    let idx = 1;

    const getDates = (dates) => {
      if (dates) {
        return [
          {
            name: dates.label,
            x: [
              dates.start,
              moment(dates.start)
                .add(dates.duration, 'seconds')
                .format('YYYY-MM-DD HH:mm:ss'),
            ],
            y: [idx, idx],
            type: 'line',
            mode: 'lines+markers',
            marker: {
              color: '#dc0d0e',
            },
            line: {
              color: '#f66364',
            },
          },
        ];
      }
      return [];
    };

    const getEphemeris = (ephemeris) => {
      if (ephemeris && ephemeris.rows && ephemeris.rows.length > 0) {
        idx++;

        const lines = [];
        ephemeris.rows.map((row) => {
          const obj = {
            name: row.name,
            duration: moment.duration(row.duration, 'seconds').humanize(),
            x: [row.start, row.finish],
            y: [idx, idx],
            legendgroup: 'ephemeris',
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: '#2196F3',
            },
            line: {
              color: '#64B5F6',
            },
            showlegend: false,
            hoverinfo: 'name+duration',
          };
          idx++;

          lines.push(obj);
          return row;
        });

        return lines;
      }
      return [];
    };

    const getCatalog = (catalog) => {
      if (catalog && catalog.rows && catalog.rows.length > 0) {
        idx++;

        const lines = [];

        catalog.rows.map((row) => {
          const obj = {
            name: row.name,
            duration: moment.duration(row.duration, 'seconds').humanize(),
            x: [row.start, row.finish],
            y: [idx, idx],
            legendgroup: 'catalog',
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: '#009688',
            },
            line: {
              color: '#4DB6AC',
            },
            showlegend: false,
            hoverinfo: 'name+duration',
          };
          idx++;

          lines.push(obj);
          return row;
        });

        return lines;
      }
      return [];
    };

    const getSearchs = (searchs) => {
      if (searchs && searchs.rows && searchs.rows.length > 0) {
        idx++;

        const lines = [];

        searchs.rows.map((row) => {
          const obj = {
            name: row.name,
            duration: moment.duration(row.duration, 'seconds').humanize(),
            x: [row.start, row.finish],
            y: [idx, idx],
            legendgroup: 'search',
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: '#8BC34A',
            },
            line: {
              color: '#AED581',
            },
            showlegend: false,
            hoverinfo: 'name+duration',
          };
          idx++;

          lines.push(obj);
          return row;
        });

        return lines;
      }
      return [];
    };

    const getMaps = (maps) => {
      if (maps && maps.rows && maps.rows.length > 0) {
        idx++;

        const lines = [];

        maps.rows.map((row) => {
          const obj = {
            name: row.name,
            duration: moment.duration(row.duration, 'seconds').humanize(),
            x: [row.start, row.finish],
            y: [idx, idx],
            legendgroup: 'maps',
            type: 'scatter',
            mode: 'lines+markers',
            marker: {
              color: '#9575CD',
            },
            line: {
              color: '#673AB7',
            },
            showlegend: false,
            hoverinfo: 'name+duration',
          };
          idx++;

          lines.push(obj);
          return row;
        });

        return lines;
      }
      return [];
    };

    const getRegister = (dates) => {
      if (dates) {
        return [
          {
            name: dates.label,
            x: [
              dates.start,
              moment(dates.start)
                .add(dates.duration, 'seconds')
                .format('YYYY-MM-DD HH:mm:ss'),
            ],
            y: [1, 1],
            type: 'line',
            mode: 'lines+markers',
            marker: {
              color: '#FF9800',
            },
            line: {
              color: '#FFB74D',
            },
          },
        ];
      }
      return [];
    };

    if (data === {}) {
      return <div />;
    }

    const dates = getDates(data.dates);
    dates.map((e) => {
      rows.push(e);
      return e;
    });

    const ephemeris = getEphemeris(data.ephemeris);
    ephemeris.map((e) => {
      rows.push(e);
      return e;
    });
    if (data.ephemeris) {
      rows.push({
        name: data.ephemeris.label,
        x: [data.ephemeris.start, data.ephemeris.finish],
        y: [1, 1],
        legendgroup: 'ephemeris',
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
          color: '#2196F3',
        },
        line: {
          color: '#64B5F6',
        },
        showlegend: true,
        hoverinfo: 'name',
      });
    }

    const catalogs = getCatalog(data.catalog);
    catalogs.map((e) => {
      rows.push(e);
      return e;
    });

    if (data.catalog) {
      rows.push({
        name: data.catalog.label,
        x: [data.catalog.start, data.catalog.finish],
        y: [1, 1],
        legendgroup: 'catalog',
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
          color: '#009688',
        },
        line: {
          color: '#4DB6AC',
        },
        showlegend: true,
        hoverinfo: 'name',
      });
    }

    const searchs = getSearchs(data.search);
    searchs.map((e) => {
      rows.push(e);
      return e;
    });

    if (data.search) {
      rows.push({
        name: data.search.label,
        x: [data.search.start, data.search.finish],
        y: [1, 1],
        legendgroup: 'search',
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
          color: '#8BC34A',
        },
        line: {
          color: '#AED581',
        },
        showlegend: true,
        hoverinfo: 'name',
      });
    }

    const maps = getMaps(data.map);
    maps.map((e) => {
      rows.push(e);
      return e;
    });

    if (data.map) {
      rows.push({
        name: data.map.label,
        x: [data.map.start, data.map.finish],
        y: [1, 1],
        legendgroup: 'maps',
        type: 'scatter',
        mode: 'lines+markers',
        marker: {
          color: '#9575CD',
        },
        line: {
          color: '#673AB7',
        },
        showlegend: true,
        hoverinfo: 'name',
      });
    }

    const register = getRegister(data.register);
    register.map((e) => {
      rows.push(e);
      return e;
    });
  }

  return (
    !loading ?
      <Plot
        className={classes.plotWrapper}
        data={rows}
        layout={{
          width,
          height,
          title: 'Time Profiler',
          xaxis: {
            title: 'Execution Time',
            automargin: true,
            autorange: true,
          },
          yaxis: {
            title: 'Asteroids',
            automargin: true,
            autorange: true,
          },
          hovermode: 'closest',
          autosize: true,
        }}
        config={{
          scrollZoom: true,
          displaylogo: false,
          responsive: true,
        }}
      />
      :
      <CircularProgress
        className={classes.circular_progress}
      />
  );
}

TimeProfile.defaultProps = {
  width: 500,
  height: 310,
  loading: false
};

TimeProfile.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  loading: PropTypes.bool
};

export function CCD({ data, width, height }) {
  const classes = useStyles();
  const Plot = createPlotlyComponent(Plotly);

  const rows = [];

  data.ccds.forEach((row, i) => {
    let showlegend = false;
    if (i === 0) {
      showlegend = true;
    }
    rows.push({
      x: row.x,
      y: row.y,
      mode: 'lines',
      line: {
        color: '#3972b3',
      },
      type: 'scatter',
      name: 'CCDs',
      showlegend,
      legendgroup: 'CCDs',
      hoverinfo: 'skip',
    });
  });

  rows.push({
    x: data.asteroids.x,
    y: data.asteroids.y,
    mode: 'markers',
    type: 'scatter',
    name: 'Asteroids',
  });

  rows.push({
    x: [null],
    y: [null],
    name: 'Query Limit',
    mode: 'lines',
    showlegend: true,
    hoverinfo: 'skip',
    line: {
      color: 'rgba(255, 26, 26, 0.7)',
    },
  });

  return (
    <Plot
      data={rows}
      className={classes.plotWrapper}
      layout={{
        title: 'Cone Search',
        width,
        height,
        hovermode: 'closest',
        autosize: true,
        xaxis: {
          title: 'RA (º)',
        },
        yaxis: {
          title: 'Dec (º)',
          scaleanchor: 'x',
        },
        shapes: [
          {
            opacity: 0.5,
            xref: 'x',
            yref: 'y',
            x0: data.asteroidsLimit.x[0],
            y0: data.asteroidsLimit.y[0],
            x1: data.asteroidsLimit.x[1],
            y1: data.asteroidsLimit.y[1],
            type: 'circle',
            line: {
              color: '#ff1a1a',
            },
          },
        ],
      }}
      config={{
        scrollZoom: true,
        displaylogo: false,
        responsive: true,
      }}
    />
  );
}

CCD.defaultProps = {
  width: 'auto',
  height: 'auto',
};

CCD.propTypes = {
  width: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  height: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  data: PropTypes.shape({
    x: PropTypes.array,
    y: PropTypes.array,
  }).isRequired,
};
