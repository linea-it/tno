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
// import Card from 'components/Card/Card.jsx';
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
      { name: 'g', band: this.state.band_g },
      { name: 'r', band: this.state.band_r },
      { name: 'y', band: this.state.band_y },
      { name: 'z', band: this.state.band_z },
      { name: 'i', band: this.state.band_i },
      { name: 'u', band: this.state.band_u },
    ];

    const exptime = [
      { name: '0-100', exposure: this.state.exp1 },
      { name: '100-200', exposure: this.state.exp2 },
      { name: '200-300', exposure: this.state.exp3 },
      { name: '300-400', exposure: this.state.exp4 },
    ];

    // const proccess_stats = [
    //   { name: 'Data Recent', value: this.state.dateRecent },
    //   { name: 'Total Size', value: this.state.totalSize },
    // ];

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
        <div className="ui-md-6">
          <td key={i}>
            <div className="ui tiny horizontal violet statistic">
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
      <div className="ui-g">
        <div className="ui-lg-6 ui-md-12 ui-sm-12">
          <PanelCostumize
            title="Graphics"
            content={
              <div className="ui-g">
                <div className="ui-md-6">
                  <Content
                    header={true}
                    lineVertical="linha-vertical"
                    title="Number of CCDs for each band"
                    content={
                      <div>
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
                        <hr size="300" width="4" align="left" color="#000000" />
                      </div>
                    }
                  />
                </div>

                <div className="ui-md-6">
                  <Content
                    header={true}
                    title="Number of CCDs in intervals of exposure time [s]"
                    content={
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
                        <Bar barSize={20} dataKey="exposure" fill="#62388C" />;
                      </BarChart>
                    }
                  />
                </div>
              </div>
            }
          />
          <br />
          <PanelCostumize
            title="Stats"
            content={
              <div>
                <Content
                  content={
                    <Table responsive>
                      <tbody>
                        <tr>
                          <div className="ui-g">{list}</div>
                        </tr>
                      </tbody>
                    </Table>
                  }
                />
                {/* <ListStats
                  badgeColumns={false}
                  status={false}
                  statstext="success"
                  data={proccess_stats}
                /> */}
                {/* <StepStats
                  disableCard="false"
                  // title=" CCDs frames downloaded"
                  info={pointing_info}
                /> */}
              </div>
            }
          />
        </div>

        <div className="ui-lg-6 ui-md-12 ui-sm-12">
          <PanelCostumize
            title="Pointings in sky"
            content={
              <div>
                <Card>
                  <figure>
                    <img
                      width="600"
                      height="451"
                      alt="text"
                      src={plotPointings}
                    />
                  </figure>
                </Card>
              </div>
            }
          />
        </div>

        {/* <div className="ui-g-8 ui-g-nopad">
          <div className="ui-g-4">
            <Card title="" subTitle="Number of CCDs for each band">
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
            </Card>
          </div>

          <div className="ui-g-5">
            <Card
              title=""
              subTitle="Number of CCDs in intervals of exposure time (seconds)"
            >
              <BarChart
                width={400}
                height={198}
                data={exptime}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar barSize={20} dataKey="exposure" fill="#75BDEE" />;
              </BarChart>
            </Card>
          </div>

          <div className="ui-g-3">
            <Card title="" subTitle="">
              <div className="ui statistics">
                <div className="plot-azul statistic">
                  <div className="value">
                    <Icon name="database" /> {this.state.totalSize}
                  </div>
                  <div className="label">Total of CCDs</div>
                </div>
              </div>

            </Card>
          </div>

          <div className="ui-g-3">
            <Card title="" subTitle="">
              <div className="ui small statistics">
                <div className="violet statistic">
                  <div className="value">
                    <Icon name="calendar alternate outline" />
                    {this.state.dateRecent}
                  </div>
                  <div className="label"> Latest pointing</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="ui-g-6">
            <Card title="" subTitle="">
              <div>
                <Statistic horizontal>
                  <Statistic.Value>{this.state.qtdDownloaded}</Statistic.Value>
                  <Statistic.Label>Number of CCDs downloaded</Statistic.Label>
                </Statistic>
                <ProgressBar
                  bsStyle="progress-h-6 progress-bar-success"
                  now={this.state.qtdDownloaded}
                  label={`${Math.round(
                    100 * this.state.qtdDownloaded / this.state.totalSize
                  )}%`}
                  max={this.state.totalSize}
                />
              
              </div>
            </Card>
          </div>

          <div className="ui-g-6">
            <Card title="" subTitle="">
              <Statistic horizontal>
                <Statistic.Value>{this.state.qtdNotDownloaded}</Statistic.Value>
                <Statistic.Label>Number of CCDs not downloaded</Statistic.Label>
              </Statistic>
              <ProgressBar
                bsStyle="progress-h-6 progress-bar progress-bar-danger"
                now={this.state.qtdNotDownloaded}
                label={`${Math.round(
                  100 * this.state.qtdNotDownloaded / this.state.totalSize
                )}%`}
                max={this.state.totalSize}
              />
            </Card>
          </div>
        </div>

        <div className="ui-g-4">
          <Card title=" Pointings in sky">
            <br />
            <figure>
              <img width="400" height="251" alt="text" src={plotPointings} />
            </figure>
          </Card>
        </div> */}
      </div>
    );
  }
}

export default PointingsStats;
