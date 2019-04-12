import React, { Component } from 'react';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import SkybotApi from 'views/SolarSystems/SkybotApi';

import { withRouter } from 'react-router-dom';
import ResultList from 'views/SolarSystems/SkybotRun/ResultList';
import PropTypes from 'prop-types';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import DonutStats from 'components/Statistics/DonutStats.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
// import SkybotTimeProfile from './TimeProfile';
import { Button } from 'primereact/button';

class SkybotRunDetail extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: 0,
      data: {},
      time_profile: [],
      list: {},
      statistic: {
        download_time: 0,
        import_time: 0,
        ccd_time: 0,
      },
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.api.getSkybotRunById({ id: params.id }).then(res => {
      const data = res.data;

      this.setState(
        {
          id: parseInt(params.id, 10),
          data: data,
        },
        () => {
          // this.loadTimeProfile(params.id);
          this.loadStatistic(params.id);
        }
      );
    });
  }

  loadTimeProfile = id => {
    this.api.getTimeProfile({ id: id }).then(res => {
      this.setState({
        time_profile: res.data.data,
      });
    });
  };

  loadStatistic = id => {
    this.api.getStatistic({ id: id }).then(res => {

      this.setState({
        statistic: res.data,
      });
    });
  };

  onClickBack = () => {
    const history = this.props.history;
    history.push(`/skybotrun/`);
  };

  create_nav_bar = () => {
    return (
      <div className="ui-toolbar">
        <Button
          label="Back"
          icon="fa fa-undo"
          onClick={() => this.onClickBack()}
        />
      </div>
    );
  };

  onViewExposure = row => {
    const history = this.props.history;
    const { id } = this.state;
    history.push(`/skybotrun_exposure/${id}/${row.expnum}`);
  };

  render() {
    const { data, statistic } = this.state;
    if (data === {}) {
      return <div />;
    }

    const stats = [
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.start },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Pointings', value: data.exposure },
      { name: 'Type', value: data.type_run },
    ];

    const execution_time = [
      {
        name: 'Download ',
        value: statistic.download_time,
      },
      {
        name: 'Import',
        value: statistic.import_time,
      },
      {
        name: 'Associate CCD',
        value: statistic.ccd_time,
      },
    ];

    const colors = ['#305D78', '#89C8F7'];

    return (
      <div className="content">
        {this.create_nav_bar()}

        <div className="p-grid">
          <div className="p-col-3">
            <PanelCostumize
              title="Summary"
              className="list_predict_occult"
              content={
                <ListStats
                  Badge="STATUS"
                  title={`Prediction Occultation - ${data.id}`}
                  statstext={data.status}
                  status={true}
                  data={stats}
                />
              }
            />
          </div>
          <div className="p-col-3">
            <PanelCostumize
              title="Execution Time"
              className="stats_predict_occult"
              content={
                <DonutStats subTitle="" data={execution_time} fill={colors} />
              }
            />
          </div>
          <div className="p-col-12">
            <PanelCostumize
              title="Skybot Results by Pointings"
              className="table_predict_occult"
              content={<ResultList skybotrun={this.state.id} view_exposure={this.onViewExposure} />}
            />
          </div>
        </div>
        {/* <div className="p-col-12">
          <PanelCostumize
            title="Time Profile"
            content={
              <SkybotTimeProfile
                width={820}
                height={480}
                data={this.state.time_profile}
              />
            }
          />
        </div> */}
      </div>
    );
  }
}

export default withRouter(SkybotRunDetail);
