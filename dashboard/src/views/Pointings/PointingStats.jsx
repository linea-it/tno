import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Icon, Statistic } from 'semantic-ui-react';
import { Card } from 'primereact/card';
import PanelCostumize from 'components/Panel/PanelCostumize';
import ListStats from 'components/Statistics/ListStats';
import { Table } from 'react-bootstrap';
import StepStats from 'components/Statistics/StepStats';
import Content from 'components/CardContent/CardContent.jsx';

import PointingApi from './PointingApi';
import plotPointings from 'assets/img/plotPointings.png';

class PointingsStats extends Component {
  state = this.initialState;
  api = new PointingApi();

  get initialState() {
    return {
      totalSize: 0,
      qtdBits: 25,
      qtdDownloaded: 0,
      qtdNotDownloaded: 0,
      band_u: 0,
      band_i: 0,
      band_z: 0,
      band_r: 0,
      band_g: 0,
      band_y: 0,
      exp1: 0,
      exp2: 0,
      exp3: 0,
      exp4: 0,
      dateConv: '',
      dateRecent: '',
    };
  }

  componentDidMount() {
    this.api.getPointingCount().then(res => {
      const r = res.data;
      this.setState({
        totalSize: r.count,
      });
    });
    this.api.getPointingBand_u().then(res => {
      const r = res.data;
      this.setState({
        band_u: r.count,
      });
    });
    this.api.getPointingBand_y().then(res => {
      const r = res.data;
      this.setState({
        band_y: r.count,
      });
    });
    this.api.getPointingBand_g().then(res => {
      const r = res.data;
      this.setState({
        band_g: r.count,
      });
    });
    this.api.getPointingBand_i().then(res => {
      const r = res.data;
      this.setState({
        band_i: r.count,
      });
    });
    this.api.getPointingBand_z().then(res => {
      const r = res.data;
      this.setState({
        band_z: r.count,
      });
    });
    this.api.getPointingBand_r().then(res => {
      const r = res.data;
      this.setState({
        band_r: r.count,
      });
    });
    this.api.getPointingBetween1().then(res => {
      const r = res.data;
      this.setState({
        exp1: r.count,
      });
    });
    this.api.getPointingBetween2().then(res => {
      const r = res.data;
      this.setState({
        exp2: r.count,
      });
    });
    this.api.getPointingBetween3().then(res => {
      const r = res.data;
      this.setState({
        exp3: r.count,
      });
    });
    this.api.getPointingBetween4().then(res => {
      const r = res.data;
      this.setState({
        exp4: r.count,
      });
    });
    this.api.getPointingDowloaded().then(res => {
      const r = res.data;
      this.setState({
        qtdDownloaded: r.count,
      });
    });

    this.api.getPointingNotDowloaded().then(res => {
      const r = res.data;
      this.setState({
        qtdNotDownloaded: r.count,
      });
    });
    this.api.getPointingDataRecent().then(res => {
      const r = res.data;
      const result = r.results[0].date_obs;
      this.setState({ dateRecent: result });
    });
  }

  render() {
    const data = [
      { name: 'u', band: this.state.band_u },
      { name: 'g', band: this.state.band_g },
      { name: 'r', band: this.state.band_r },
      { name: 'i', band: this.state.band_i },
      { name: 'z', band: this.state.band_z },
      { name: 'Y', band: this.state.band_y },
    ];

    const exptime = [
      { name: '0-100', exposure: this.state.exp1 },
      { name: '100-200', exposure: this.state.exp2 },
      { name: '200-300', exposure: this.state.exp3 },
      { name: '300-400', exposure: this.state.exp4 },
    ];

    const pointing_info = [
      {
        legend: 'Downloaded',
        label: this.state.qtdDownloaded,
        value: this.state.qtdDownloaded,
        colorIcon: 'primary',
        grid: ['6'],
      },
      {
        legend: 'not Downloaded',
        label: this.state.qtdNotDownloaded,
        value: this.state.qtdNotDownloaded,
        colorIcon: 'muted',
        grid: ['6'],
      },
    ];

    const stats = [
      { name: 'Data Recent', value: this.state.dateRecent, icon: 'database' },
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
      <div className="grid template grid-column stretch">
        <PanelCostumize
          className="plot-ccd-band"
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
                        data={data}
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
          className="plot_ccd_band"
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
                      data={exptime}
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
          className="plot_sky"
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
          className="list_stats"
          content={
            <Content
              content={<div className="flex-container flex wrap">{list}</div>}
            />
          }
        />

        {/* <PanelCostumize
          className="item grow-1"
          title="Stats"
          content={
            <div>
              <Content
                content={
                  <Table responsive>
                    <tbody>
                      <div className="flex-container flex-wrap column">
                        <tr>{list}</tr>
                      </div>
                    </tbody>
                  </Table>
                }
              /> */}
        {/* <ListStats
                  badgeColumns={false}
                  status={false}
                  statstext="success"
                  data={stats}
                /> */}
        {/* <StepStats
                  disableCard="false"
                  // title=" CCDs frames downloaded"
                  info={pointing_info}
                /> */}
      </div>
      //   }
      //   />
      // </div>
    );
  }
}

export default PointingsStats;
