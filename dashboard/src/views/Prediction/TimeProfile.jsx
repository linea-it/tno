// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { style } from 'variables/Variables.jsx';
import Plot from 'react-plotly.js';
import moment from 'moment';
class PredictionTimeProfile extends Component {
  state = this.initialState;

  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  idx = 1;

  get initialState() {
    return {};
  }

  getDates = dates => {
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
          y: [this.idx, this.idx],
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
    } else {
      return [];
    }
  };

  getEphemeris = data => {
    if (data && data.rows && data.rows.length > 0) {
      this.idx++;

      var rows = [];

      data.rows.map(row => {
        var obj = {
          name: row.name,
          duration: moment.duration(row.duration, 'seconds').humanize(),
          x: [row.start, row.finish],
          y: [this.idx, this.idx],
          // legendgroup: 'ephemeris',
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
        this.idx++;

        rows.push(obj);
        return;
      });

      return rows;
    } else {
      return [];
    }
  };

  getCatalog = data => {
    if (data && data.rows && data.rows.length > 0) {
      this.idx++;

      var rows = [];

      data.rows.map(row => {
        var obj = {
          name: row.name,
          duration: moment.duration(row.duration, 'seconds').humanize(),
          x: [row.start, row.finish],
          y: [this.idx, this.idx],
          // legendgroup: 'ephemeris',
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
        this.idx++;

        rows.push(obj);
        return;
      });

      return rows;
    } else {
      return [];
    }
  };

  getSearchs = data => {
    if (data && data.rows && data.rows.length > 0) {
      this.idx++;

      var rows = [];

      data.rows.map(row => {
        var obj = {
          name: row.name,
          duration: moment.duration(row.duration, 'seconds').humanize(),
          x: [row.start, row.finish],
          y: [this.idx, this.idx],
          // legendgroup: 'ephemeris',
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
        this.idx++;

        rows.push(obj);
        return;
      });

      return rows;
    } else {
      return [];
    }
  };

  getMaps = data => {
    if (data && data.rows && data.rows.length > 0) {
      this.idx++;

      var rows = [];

      data.rows.map(row => {
        var obj = {
          name: row.name,
          duration: moment.duration(row.duration, 'seconds').humanize(),
          x: [row.start, row.finish],
          y: [this.idx, this.idx],
          // legendgroup: 'ephemeris',
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
        this.idx++;

        rows.push(obj);
        return;
      });

      return rows;
    } else {
      return [];
    }
  };

  getRegister = dates => {
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
          y: [this.idx, this.idx],
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
    } else {
      return [];
    }
  };

  render() {
    const { data, width, height } = this.props;

    if (data === {}) {
      return <div />;
    }

    var rows = [];

    const dates = this.getDates(data.dates);
    dates.map(e => {
      rows.push(e);
      return;
    });

    const ephemeris = this.getEphemeris(data.ephemeris);
    ephemeris.map(e => {
      rows.push(e);
      return;
    });

    const catalogs = this.getCatalog(data.catalog);
    catalogs.map(e => {
      rows.push(e);
      return;
    });

    const searchs = this.getSearchs(data.search);
    searchs.map(e => {
      rows.push(e);
      return;
    });

    const maps = this.getMaps(data.map);
    maps.map(e => {
      rows.push(e);
      return;
    });

    const register = this.getRegister(data.register);
    register.map(e => {
      rows.push(e);
      return;
    });

    // console.log('Rows: ', rows);

    return (
      <div style={{ width: width, height: height }}>
        <Plot
          data={rows}
          layout={{
            width: width,
            height: height,
            title: 'Time Profile',
            xaxis: {
              title: 'Execution Time',
            },
            yaxis: {
              title: 'Asteroids',
            },
          }}
          config={{
            scrollZoom: true,
          }}
        />
      </div>
    );
  }
}

export default PredictionTimeProfile;
