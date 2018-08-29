import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import OrbitApi from './OrbitApi';

import { withRouter } from 'react-router-dom';
import AsteroidList from './AsteroidList';
import PropTypes from 'prop-types';
import DonutStats from 'components/Statistics/DonutStats.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
import StepStats from 'components/Statistics/StepStats.jsx';
import { Card } from 'primereact/card';
import RefineOrbitTimeProfile from './TimeProfile';

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

    if (data == {}) {
      return <div />;
    }

    const stats = [
      { name: 'Status', value: data.status },
      { name: 'Proccess', value: data.proccess_displayname },
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.h_time },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Asteroids', value: data.count_objects },
    ];

    const stats2 = [
      { name: 'Active Projects', value: 400 },
      { name: 'Active Projects', value: 400 },
      { name: 'Active Projects', value: 400 },
    ];

    const stats_status = [
      { name: 'Success', value: data.count_success },
      { name: 'Warning', value: data.count_warning },
      { name: 'Failure', value: data.count_failed },
      { name: 'not Executed', value: data.count_not_executed },
    ];
    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

    return (
      <div>
        <div className="ui-g">
          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <ListStats
              statstext={this.state.data.status}
              status={true}
              title={`Refine Orbit - ${data.id}`}
              data={stats}
            />
          </div>

          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <DonutStats
                title="Execution Statistics"
                data={stats_status}
                fill={colors}
              />
            </div>

            {/* <div className="ui-g-4 ui-md-12 ui-sm-1">
              <StepStats title="Step Stats" columns={stats2} />
            </div> */}
          </div>
          <div className="ui-g-4 ui-md-4">
            <Card title="" subTitle="Time Profile">
              <RefineOrbitTimeProfile data={this.state.time_profile} />
            </Card>
          </div>
        </div>

        <div className="ui-g">
          <div className="ui-g-12">
            <AsteroidList
              orbit_run={this.state.id}
              view_asteroid={this.onViewAsteroid}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RefineOrbitRunDetail);
