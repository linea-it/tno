import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PraiaHistory from './PraiaHistory';
import PraiaConfig from './PraiaConfig';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';

class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {};
  }

  componentDidMount() {}

  render() {
    return (
      <div className="content">
        <Tabs defaultActiveKey={1} animation={true}>
          <Tab eventKey={1} title="PRAIA">
            <PraiaConfig />
          </Tab>
          <Tab eventKey={2} title="Runing">
            <PraiaRunning />
          </Tab>
          <Tab eventKey={3} title="History">
            <PraiaHistory />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(Praia);
