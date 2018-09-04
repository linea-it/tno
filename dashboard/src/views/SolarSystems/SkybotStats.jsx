import React, { Component } from 'react';

import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Icon } from 'semantic-ui-react';
import PanelCostumize from 'components/Panel/PanelCostumize';
// import Card from 'components/Card/Card.jsx';
import { Card } from 'primereact/card';
import { Table } from 'react-bootstrap';

import SkybotApi from './SkybotApi';

const band = [
  { name: 'g', objects: 590, observations: 800, amt: 1400 },
  { name: 'r', objects: 868, observations: 967, amt: 1506 },
  { name: 'Y', objects: 1397, observations: 1098, amt: 989 },
  { name: 'z', objects: 1480, observations: 1200, amt: 1228 },
  { name: 'i', objects: 1520, observations: 1108, amt: 1100 },
  { name: 'u', objects: 1400, observations: 680, amt: 1700 },
];

const objects = [
  { name: 'Hungaria', objects: 590, observations: 800, Media: 1400 },
  { name: 'KBO', objects: 868, observations: 967, Media: 1506 },
  { name: 'Mars-Crosser', objects: 1397, observations: 1098, Media: 989 },
  { name: 'MB', objects: 1480, observations: 1200, Media: 1228 },
  { name: 'NEA', objects: 1520, observations: 1108, Media: 1100 },
  { name: 'Trojan', objects: 1400, observations: 680, Media: 1700 },
];

class SkybotStats extends Component {
  state = this.initialState;
  api = new SkybotApi();

  get initialState() {
    return {
      totalSize: '11204',
      bandValue: [
        {
          label: 'u',
          value: 0,
        },
        {
          label: 'i',
          value: 0,
        },
        {
          label: 'z',
          value: 0,
        },
        {
          label: 'r',
          value: 0,
        },
        {
          label: 'g',
          value: 0,
        },
        {
          label: 'y',
          value: 0,
        },
      ],
    };
  }

  render() {
    const data = [
      { name: 'Total of CCDs', value: this.state.totalSize, icon: 'database' },
      {
        name: 'Total number of observations',
        value: this.state.totalSize,
        icon: 'search',
      },
      {
        name: ' object with the largest number of observations',
        value: this.state.totalSize,
        icon: 'flag checkered',
      },
    ];

    const columns = data.map((col, i) => {
      return (
        <tr key={i}>
          <td>
            <div className="ui ex-mini horizontal violet statistic">
              <div className="value">
                <Icon className="icon" name={`${data[i].icon}`} />
                <span className="icon">{data[i].value}</span>
              </div>
              <div className="label">{data[i].name}</div>
            </div>
          </td>
        </tr>
      );
    });

    return (
      <div className="ui-g">
        <div className="ui-lg-4 ui-md-12 ui-sm-12">
          <PanelCostumize
            className="panel"
            content={
              <div>
                <Card className="none table-overflow ">
                  <Table responsive>
                    <tbody>{columns}</tbody>
                  </Table>
                </Card>
              </div>
            }
          />
        </div>
        <div className="ui-lg-4 ui-md-12 ui-sm-12">
          <PanelCostumize
            content={
              <Card
                className="none"
                subTitle="Total number of objects (and their observations) for each"
              >
                <ComposedChart
                  width={400}
                  height={200}
                  data={objects}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend className="legend-chart" />
                  {/* <Area
                    type="monotone"
                    dataKey="Media"
                    fill="#007892"
                    stroke="#8884d8"
                  /> */}
                  <Bar dataKey="observations" barSize={20} fill="#3c1e7e" />
                  <Line type="monotone" dataKey="objects" stroke="#ff7300" />
                </ComposedChart>
              </Card>
            }
          />
        </div>
        <div className="ui-lg-4 ui-md-12 ui-sm-12">
          <PanelCostumize
            content={
              <Card
                className="none"
                subTitle="Total number of objects (and observations) for each band (u,g, r, i, z)"
              >
                <ComposedChart
                  width={400}
                  height={200}
                  data={band}
                  margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid stroke="#f5f5f5" />
                  {/* <Area
                    type="monotone"
                    dataKey=""
                    fill="#00b5ad"
                    stroke="#00b5ad"
                  /> */}
                  <Bar dataKey="objects" barSize={20} fill="#3c1e7e" />
                  <Line
                    type="monotone"
                    dataKey="observations"
                    stroke="#ff7300"
                  />
                </ComposedChart>
              </Card>
            }
          />
        </div>
      </div>
    );
  }
}

export default SkybotStats;
