import React, { Component } from 'react';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import OrbitApi from 'views/Prediction/PredictionApi';

import { withRouter } from 'react-router-dom';
import AsteroidList from 'views/Prediction/AsteroidList';
import PropTypes from 'prop-types';
import DonutStats from 'components/Statistics/DonutStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
import PredictionTimeProfile from './TimeProfile';
import moment from 'moment';
import { Button } from 'primereact/button';

class PredictionDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: 0,
      data: {},
      time_profile: {},
      list: {},
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.api.getPredictionRunById({ id: params.id }).then(res => {
      const data = res.data;

      this.setState({
        id: parseInt(params.id, 10),
        data: data,
      });

      if (data.status === 'success') {
        this.api.getTimeProfile({ id: params.id }).then(res => {
          this.setState({
            time_profile: res.data.data,
          });
        });
      }
    });
  }
  onClickBackToPredictRun = () => {
    const history = this.props.history;
    history.push(`/prediction/`);
  };

  onViewAsteroid = asteroid_id => {
    const history = this.props.history;
    history.push(`/predict_asteroid/${asteroid_id}`);
  };
  create_nav_bar = () => {
    return (
      <div className="ui-toolbar">
        <Button
          label="Back"
          icon="fa fa-undo"
          onClick={() => this.onClickBackToPredictRun()}
        />
      </div>
    );
  };

  render() {
    const { data } = this.state;
    if (data === {}) {
      return <div />;
    }

    const stats = [
      { name: 'Status', value: data.status },
      { name: 'Proccess', value: data.process_displayname },
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.h_time },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Asteroids', value: data.count_objects },
      { name: 'Occultations', value: data.occultations },
    ];

    const executo_time = [
      {
        name: 'Dates',
        value: Math.round(moment.duration(data.execution_dates).asSeconds()),
      },

      {
        name: 'Ephemeris',
        value: Math.round(
          moment.duration(data.execution_ephemeris).asSeconds()
        ),
      },
      {
        name: 'Gaia',
        value: Math.round(moment.duration(data.execution_catalog).asSeconds()),
      },
      {
        name: 'Search Candidates',
        value: Math.round(
          moment.duration(data.execution_search_candidate).asSeconds()
        ),
      },
      {
        name: 'Maps',
        value: Math.round(moment.duration(data.execution_maps).asSeconds()),
      },
      {
        name: 'Register',
        value: Math.round(moment.duration(data.execution_register).asSeconds()),
      },
    ];

    const colors_time = [
      '#1D3747',
      '#305D78',
      '#89C8F7',
      '#A8D7FF',
      '#434343',
      '#430390',
    ];

    const stats_status = [
      { name: 'Success', value: data.count_success},
      { name: 'Warning', value: data.count_warning },
      { name: 'Failure', value: data.count_failed },
      { name: 'not Executed', value: data.count_not_executed },
    ];
    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

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
                  data={stats}
                />
              }
            />
          </div>
          <div className="p-col-3">
            <PanelCostumize
              title="Status"
              className="stats_predict_occult"
              content={
                <DonutStats
                  subTitle="Statistics of executation"
                  data={stats_status}
                  fill={colors}
                />
              }
            />
          </div>
          <div className="p-col-3">
            <PanelCostumize
              title="Execution Time"
              className="stats_predict_occult2"
              content={
                <DonutStats
                  subTitle="Statistics of executation"
                  data={executo_time}
                  fill={colors_time}
                />
              }
            />
          </div>
          <div className="p-col-12">
            <PanelCostumize
              title="Asteroids"
              className="table_predict_occult"
              content={
                <AsteroidList
                  predict_run={this.state.id}
                  view_asteroid={this.onViewAsteroid}
                />
              }
            />
          </div>
        </div>
        <div className="p-col-12">
          <PanelCostumize
            title="Time Profile"
            content={
              <PredictionTimeProfile
                width={820}
                height={480}
                data={this.state.time_profile}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default withRouter(PredictionDetail);
