import React, { Component } from 'react';
import { Button } from 'primereact/button';
import SkybotApi from './SkybotApi';

class SkybotRun extends Component {

  apiSkybotRun = new SkybotApi();

  state = this.initialState;

  get initialState() {
    return {
    //   start: null,
    //   final: null,
      status: 'pending',
      exposure: 232,
    };
  }

  onClickSubmit = () => {
    const {
      start: start,
      final: final,
      status: status,
      exposure: exposure,
    } = this.state;

    this.apiSkybotRun
      .createSkybotRun({
        start: start,
        final: final,
        status: status,
        exposure: exposure,
      })
      .then(res => {
        this.onCreateSuccess(res.data);
      })
      .catch(error => {
        this.onCreateFailure(error);
      });
  };

  render() {
    return (
      <div>
        <Button label="Run Skybot" onClick={this.onClickSubmit} />
      </div>
    );
  }
}

export default SkybotRun;
