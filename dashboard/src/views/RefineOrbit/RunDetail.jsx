import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import OrbitApi from './OrbitApi';
import { withRouter } from 'react-router-dom';
import AsteroidList from './AsteroidList';
import PropTypes from 'prop-types';
import DonutStats from 'components/StatsCard/DonutStats.jsx';
import ListStats from 'components/ListStats/ListStats.jsx';
import StepStats from 'components/StepStats/StepStats.jsx';

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
    });
  }

  onViewAsteroid = asteroid_id => {
    const history = this.props.history;
    history.push(`/refined_asteroid/${asteroid_id}`);
  };

  render() {
    const stats = [
      { name: 'STATUS', value: 400 },
      { name: 'Active Projects', value: 400 },
      { name: 'Open Tasks', value: 300 },
      { name: 'Support Tickets', value: 200 },
      { name: 'Active Timers', value: 300 },
    ];

    const stats2 = [
      { name: 'Active Projects', value: 400 },
      { name: 'Active Projects', value: 400 },
      { name: 'Active Projects', value: 400 },
    ];

    const data = [
      { name: 'Executado', value: 400 },
      { name: 'Warning', value: 300 },
      { name: 'Não dfdff', value: 200 },
      { name: 'Fail', value: 300 },
    ];
    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

    return (
      <div>
        <div className="ui-g">
          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <ListStats Badge="STATUS" title="My Stats" data={stats} />
          </div>

          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <DonutStats
                subTitle="Statistics of executation"
                data={data}
                fill={colors}
              />
            </div>

            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <StepStats title="My Stats" columns={stats2} />
            </div>
          </div>

          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <ListStats Badge="STATUS" title="My Stats" data={stats} />
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
