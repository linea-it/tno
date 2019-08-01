import React, { Component } from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import PanelCostumize from 'components/Panel/PanelCostumize';
import Content from 'components/CardContent/CardContent.jsx';

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
      {
        name: 'Total of CCDs',
        value: this.state.totalSize,
        icon: 'database',
        title: 'amount',
      },
      {
        name: 'Total number of observations',
        value: this.state.totalSize,
        icon: 'search',
        title: 'amount',
      },
      {
        name: ' object with the largest number of observations',
        value: 'KBO',
        icon: 'flag checkered',
        title: 'name',
      },
      {
        name: `Number of observations of object KBO`,
        value: this.state.totalSize,
        icon: 'search',
        title: 'amount',
      },
    ];

    const list = data.map((col, i) => {
      return (
        <div key={i}>
          <div className="item">
            <div className="label-stats">{data[i].name}</div>
            <div className="value-stats">
              {' '}
              {data[i].title}: {data[i].value}
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="grid template-skybot">
        <PanelCostumize
          className="list_stats_skybot"
          noHeader={true}
          content={
            <Content content={<div className="group-stats">{list}</div>} />
          }
        />

        <PanelCostumize
          className="plot_dinamics"
          title="plot_dinamics"
          content={
            <Content
              header={true}
              title="Total number of objects (and their observations) for each"
              content={
                <BarChart
                  width={400}
                  height={200}
                  data={band}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="observations" stackId="a" fill="#62388C" />
                  <Bar dataKey="objects" stackId="a" fill="#3CB1C6" />
                </BarChart>
              }
            />
          }
        />

        <PanelCostumize
          className="plot_band"
          title="plot_band"
          content={
            <Content
              header={true}
              title="Total number of objects (and observations) for each band (u,g, r, i, z)"
              content={
                <BarChart
                  width={500}
                  height={200}
                  data={objects}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="observations" stackId="a" fill="#62388C" />
                  <Bar dataKey="objects" stackId="a" fill="#3CB1C6" />
                </BarChart>
              }
            />
          }
        />
      </div>
    );
  }
}

export default SkybotStats;
