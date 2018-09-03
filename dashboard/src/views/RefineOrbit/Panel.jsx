import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import RefineOrbitSubmit from './Submit';
import RefineOrbitRunning from './Running';
import RefineOrbitHistory from './History';
import PropTypes from 'prop-types';

class RefineOrbitPanel extends Component {
  state = this.initialState;
  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      // Praia Run recem criado e que esta em andamento ainda
      record: {},
    };
  }

  onCreateRun = record => {
    // Toda vez que cria um novo registro forca a execucao do metodo render()
    this.setState({ record: record });
  };

  render() {
    const { record } = this.state;
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <RefineOrbitSubmit onCreateRun={this.onCreateRun} />
          </div>
          <div className="ui-g-8">
            <RefineOrbitRunning record={record} />
          </div>
        </div>
        <div className="ui-g">
          <div className="ui-g-12">
            <RefineOrbitHistory onRerun={this.onCreateRun} />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RefineOrbitPanel);
