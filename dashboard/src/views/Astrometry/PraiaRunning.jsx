import React, { Component } from 'react';
import { Card } from 'primereact/card';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
class PraiaRunning extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {};
  }

  static propTypes = {
    record: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    return (
      <div className="content">
        <Card className="none">
          {/* <div className="content">PRAIA RUN ID: {id}</div> */}
        </Card>
      </div>
    );
  }
}

export default PraiaRunning;
