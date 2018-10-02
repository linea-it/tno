import React, { Component } from 'react';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Icon } from 'semantic-ui-react';
import PanelCostumize from 'components/Panel/PanelCostumize';
import Content from 'components/CardContent/CardContent.jsx';

import PointingApi from './PointingApi';
import plotPointings from 'assets/img/plotPointings.png';

class PointingsStats extends Component {
  state = this.initialState;
  api = new PointingApi();

  get initialState() {
    return {
      totalSize: 0,
      exp: [],
      band: [],
      dateRecent: '',
    };
  }
  
  componentDidMount() {

    this.api.getPointingStatistics().then(res => {

      const r = res.data;
      const count = r.count_pointings;
      const exp_range = r.exp_range;
      const band = r.band;
      const last = r.last;

      this.setState({ 
        exp: exp_range, 
        band: band,
        totalSize: count,
        dateRecent: last
      });
    });
  }

  render() {

    const stats = [
      { name: 'Data Recent (Date of Observation) ', value: this.state.dateRecent, icon: 'database' },
      { name: 'Total Size', value: this.state.totalSize, icon: 'database' },
    ];
    
    const list = stats.map((col, i) => {
      return (
        <div key={i} className="item grow-6">
          <td key={i}>
            <div className="ui horizontal violet statistic">
              <div className="value">
                <Icon name={`${stats[i].icon}`} />
                {stats[i].value}
              </div>
              <div className="label">{stats[i].name}</div>
            </div>
          </td>
        </div>
      );
    });

    return (
      <div className="flex-container flex-wrap">
        <PanelCostumize
          className="item grow-1"
          title="CCDs x Band"
          content={
            <div className="flex-container">
              <div className="item grow-1">
                <Content
                  header={true}
                  title="Number of CCDs for each band"
                  content={
                    <div className="size-plot">
                      <BarChart
                        width={275}
                        height={198}
                        data={this.state.band}
                        {...console.log(this.state.band)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar barSize={20} dataKey="band" fill="#62388C" />;
                      </BarChart>
                    </div>
                  }
                />
              </div>
            </div>
          }
        />
        <PanelCostumize
          className="item grow-1"
          title="CCDs x Esposure time"
          content={
            <div className="item grow-1">
              <Content
                header={true}
                title="Number of CCDs in intervals of exposure time [s]"
                content={
                  <div className="size-plot">
                    <BarChart
                      width={275}
                      height={198}
                      data={this.state.exp}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar barSize={20} dataKey="exposure" fill="#3CB1C6" />;
                    </BarChart>
                  </div>
                }
              />
            </div>
          }
        />

        <PanelCostumize
          className="item grow-1"
          title="Pointings in sky"
          content={
            <div>
              <Content
                content={
                  <figure className="responsive-image">
                    <img
                      // width="600"
                      // height="451"
                      alt="text"
                      src={plotPointings}
                    />
                  </figure>
                }
              />
            </div>
          }
        />

        <PanelCostumize
          className="item grow-1"
          content={
            <Content
              content={<div className="flex-container flex wrap">{list}</div>}
            />
          }
        />
        </div>

    );
  }
}

export default PointingsStats;
