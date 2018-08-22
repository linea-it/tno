// React e Prime React
import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import OrbitApi from './OrbitApi';

import { withRouter } from 'react-router-dom';
import AsteroidList from './AsteroidList';
import PropTypes from 'prop-types';
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
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <Card
              title="Statistics"
              subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
            />
          </div>
          <div className="ui-g-4">
            <Card title="" subTitle="" />
          </div>
          <div className="ui-g-4">
            <Card title="" subTitle="">
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
