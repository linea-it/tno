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
import moment from 'moment';
import StepStats from 'components/Statistics/StepStats.jsx';
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
      time_profile: [],
      list: {},
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    // this.api.Prediction().then(res => {
    //   const r = res.data;
    //   this.setState({ list: r });
    // });

    // console.log('Orbit Run Id: %o', params.id);

    this.api.getPredictionRunById({ id: params.id }).then(res => {
      const data = res.data;

      this.setState({
        id: parseInt(params.id, 10),
        data: data,
      });

      // if (data.status === 'success') {
      //   this.api.getOrbitRunTimeProfile({ id: params.id }).then(res => {
      //     this.setState({
      //       time_profile: res.data.data,
      //     });
      //   });
      // }
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
      { name: 'Success', value: 3232 },
      { name: 'Warning', value: 4 },
      { name: 'Failure', value: 0 },
      { name: 'not Executed', value: 0 },
    ];
    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

    return (
      <div className="grid template-predict-occult">
        <div className="navigation_predict_occult">{this.create_nav_bar()}</div>

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
    );
  }
}

export default withRouter(PredictionDetail);
