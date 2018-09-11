import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PraiaSubmit from './PraiaSubmit';
import PraiaHistory from './PraiaHistory';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';
class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();
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
    this.setState(this.state);
  };

  render() {
    const { record } = this.state;
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <PraiaSubmit onCreateRun={this.onCreateRun} />
          </div>
          <div className="ui-g-8">
            <PraiaRunning record={record} />
          </div>
        </div>
        <div className="ui-g">
          <div className="ui-g-12">
            <PraiaHistory />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Praia);
