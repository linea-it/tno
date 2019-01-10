import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//sections dashboard
import sizeMe from 'react-sizeme';
import Exposure from './Exposure.jsx';
import Process from './Process.jsx';
import Skybot from './Skybot.jsx';
import Performance from './Perfomance.jsx';
import PlotImages from './PlotImages.jsx';
import Histograms from './Histograms.jsx';

//API
import DashboardApi from './DashboardApi.jsx';

class Dashboard extends Component {
  state = this.initialState;
  api = new DashboardApi();

  get initialState() {
    return {
      exposures: {
        count_pointings: 0,
        downloaded: 0,
        not_downloaded: 0,
        last: '',
        first: '',
        exposures: 0,
        updated: '',
        size: '',
      },
      ccds: {
        count_asteroids: 0,
        unique_ccds: 0,
        asteroids_by_class: [
          {
            class_name: 'KBO',
            count: 0,
          },
          {
            class_name: 'Centaur',
            count: 0,
          },
          {
            class_name: 'Trojan',
            count: 0,
          },
          {
            class_name: 'MB',
            count: 0,
          },
        ],
        asteroids_by_dynclass: [],
        histogram: [],
        histogram_exposure: [],
      },
    };
  }

  componentDidMount() {
    this.api.getExposuresInfo().then(res => {
      const exposures = res.data;

      this.setState({
        exposures: exposures,
      });

      this.api.getSkybotInfo().then(res => {
        const ccds = res.data;

        this.setState({
          ccds: ccds,
        });
      });

      this.get_histogram_exposure();
    });
  }

  get_histogram_exposure = () => {
    console.log('get_histogram_exposure');

    this.api.getHistogramExposure().then(res => {
      console.log(res.data);
      if (res.data.success === true) {
        this.setState({
          histogram_exposure: res.data.data,
        });
      }
    });
  };

  render() {
    const { exposures, ccds } = this.state;

    const data = [
      { name: 'Executado', value: 400 },
      { name: 'Warning', value: 300 },
      { name: 'Não executado', value: 200 },
      { name: 'Fail', value: 300 },
    ];

    const proccess_stats = [
      { name: 'Proccess', value: 'xxx - xxxxxxx xxxxx' },
      { name: 'Owner', value: 'xxxxxxxxx' },
      { name: 'Start', value: 'xxxx-xx-xx xx:xx:xx' },
      { name: 'Asteroids', value: 'xxx' },
    ];

    const data_exposures = [
      { name: 'CCD exposures', value: exposures.exposures },
      { name: 'Pointings', value: exposures.count_pointings },
      { name: 'Most recent', value: exposures.last },
      { name: 'Updated', value: exposures.update },
      { name: 'Size', value: exposures.size },
    ];

    const data_skybot = [
      { name: 'CDDs', value: ccds.unique_ccds },
      { name: 'Asteroids', value: ccds.count_asteroids },
      { name: 'Update', value: 'xxxx-xx-xx' },
      { name: 'Skybot', value: 'vx.x.x' },
    ];

    const colors = ['rgba(255,255,255,0.2)', '#ffffff', '#ffffff', '#ffffff'];

    const exposure_info = [
      {
        legend: 'Downloaded',
        label: exposures.downloaded,
        value: exposures.downloaded,
        colorIcon: 'primary',
        grid: ['6'],
      },
      {
        legend: 'not Downloaded',
        label: exposures.not_downloaded,
        value: exposures.not_downloaded,
        colorIcon: 'muted',
        grid: ['6'],
      },
    ];
    return (
      <div className="p-dir-col">
        <div className="p-col-12">
          <div className="box box-margin">
            <Exposure
              exposure_info={exposure_info}
              data_exposures={data_exposures}
              data_histogram={this.state.histogram_exposure}
            />
          </div>
        </div>
        <div className="p-col-12">
          <div className="box box-margin">
            <Skybot ccds={ccds} data={data_skybot} />
          </div>
        </div>
        <div className="p-col-12">
          <div className="box box-margin">
            <Histograms ccds={ccds} />
          </div>
        </div>
        <div className="p-col-12">
          <div className="p-grid">
            <div className="p-col-6">
              <Process proccess_stats={proccess_stats} />
            </div>
            <div className="p-col-6">
              <PlotImages />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default sizeMe({ monitorHeight: true })(Dashboard);
