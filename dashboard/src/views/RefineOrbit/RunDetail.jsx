import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import OrbitApi from './OrbitApi';
import StepStats from 'components/Statistics/StepStats.jsx';
import { withRouter } from 'react-router-dom';
import AsteroidList from './AsteroidList';
import PropTypes from 'prop-types';
import DonutStats from 'components/Statistics/DonutStats.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
import { Card } from 'primereact/card';
import RefineOrbitTimeProfile from './TimeProfile';
import moment from 'moment';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';
class RefineOrbitRunDetail extends Component {
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
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    // console.log('Orbit Run Id: %o', params.id);

    this.api.getOrbitRunById({ id: params.id }).then(res => {
      const data = res.data;

      this.setState({
        id: parseInt(params.id, 10),
        data: data,
      });

      if (data.status === 'success') {
        this.api.getOrbitRunTimeProfile({ id: params.id }).then(res => {
          this.setState({
            time_profile: res.data.data,
          });
        });
      }
    });
  }

  onViewAsteroid = asteroid_id => {
    const history = this.props.history;
    history.push(`/refined_asteroid/${asteroid_id}`);
  };

  render() {
    const { data } = this.state;

    if (data === {}) {
      return <div />;
    }

    const stats = [
      { name: 'Proccess', value: data.proccess_displayname },
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.h_time },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Asteroids', value: data.count_objects },
    ];

    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

    const execute_time = [
      {
        legend: 'Download',
        label: data.execution_download_time,
        value: Math.round(
          moment.duration(data.execution_download_time).asSeconds()
        ),
        colorIcon: 'primary',
        grid: ['6'],
      },
      {
        legend: 'NIMA',
        label: data.execution_nima_time,
        value: Math.round(
          moment.duration(data.execution_nima_time).asSeconds()
        ),
        colorIcon: 'info',
        grid: ['6'],
      },
    ];

    const stats_status = [
      { name: 'Success', value: data.count_success },
      { name: 'Warning', value: data.count_warning },
      { name: 'Failure', value: data.count_failed },
      { name: 'not Executed', value: data.count_not_executed },
    ];

    return (
      <div>
        <div className="ui-g">
          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <PanelCostumize
              title={`Refine Orbit - ${data.id}`}
              content={
                <ListStats
                  statstext={this.state.data.status}
                  status={true}
                  //title={`Refine Orbit - ${data.id}`}
                  data={stats}
                />
              }
            />
          </div>

          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <PanelCostumize
                title="Execution Statistics"
                content={<DonutStats data={stats_status} fill={colors} />}
              />
            </div>
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <PanelCostumize
                title="Step Stats"
                content={<StepStats info={execute_time} />}
              />
            </div>
          </div>
          <div className="ui-g-4 ui-md-4">
            <PanelCostumize
              title="Execution Time"
              content={
                <Card>
                  <RefineOrbitTimeProfile data={this.state.time_profile} />
                </Card>
              }
            />
          </div>
        </div>

        <div className="ui-g">
          <div className="ui-g-12">
            <PanelCostumize
              title="History"
              content={
                <AsteroidList
                  orbit_run={this.state.id}
                  view_asteroid={this.onViewAsteroid}
                />
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RefineOrbitRunDetail);
