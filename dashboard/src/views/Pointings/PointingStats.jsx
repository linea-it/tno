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
        dateRecent: last,
      });
    });
  }

  render() {
    const propSet = this.props;

    const band = this.state.band.map((el, i) => {
      const band = {
        name: el.name,
        band: el.band,
      };
      return band;
    });

    let exptime = [];
    if (this.state.exp && this.state.exp.length > 0) {
      exptime = this.state.exp.map((el, i) => {
        const exptime = {
          name: el.name,
          exposure: el.exposure,
        };
        return exptime;
      });
    }


    const stats = [
      {
        name: 'Data Recent',
        value: this.state.dateRecent,
        icon: 'database',
        title: 'amount',
      },
      {
        name: 'Total Size',
        value: this.state.totalSize,
        icon: 'database',
        title: 'amount',
      },
    ];

    const list = stats.map((col, i) => {
      return (
        <div key={i}>
          <div key={i} className="item">
            <div className="label-stats">{stats[i].name}</div>
            <div className="value-stats">
              {stats[i].title}: {stats[i].value}
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className={`${propSet.className} section`}>
        <div className="grid template-pointigs">
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
                          data={band}
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
            noHeader={true}
            content={
              <Content content={<div className="group-stats">{list}</div>} />
            }
          />
        </div>
      </div>
    );
  }
}

export default PointingsStats;
