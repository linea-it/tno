import React, { Component } from 'react';
// API
import SkybotApi from '../SkybotApi';
// INPUTS MODAL
import Square from './Square';
import Circle from './Circle';
import Period from './Period';
import Content from 'components/CardContent/CardContent.jsx';
// PRIME REACT
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

class FormSkybot extends Component {
  skybotApi = new SkybotApi();
  state = {
    visiblePeriod: false,
    visibleArea: false,
    show: false,
    area: null,
    value: null,
    start: null,
    final: null,
    exposure: 0,
    date_initial: null,
    date_final: null,
    type_run: '',
    ra_cent: null,
    dec_cent: null,
    radec_ul: 0,
    radec_ur: 0,
    radec_ll: 0,
    radec_lr: 0,
  };

  radec = (ur, ul, lr, ll) => {
    console.log('caiu aqui', ur, ul, lr, ll);
    this.setState(
      { radec_ur: ur, radec_ul: ul, radec_lr: lr, radec_ll: ll },
      () => {
        this.onSubmit();
      }
    );
  };

  options = [
    { label: 'Exposure', value: 'all' },
    { label: 'Period', value: 'period' },
    { label: 'Square', value: 'square' },
    { label: 'Circle', value: 'circle' },
  ];

  // Methods with content modal
  getSquareFields = () => {
    return (
      <Square
        show={this.state.show}
        onHide={this.modalClose}
        radec={this.radec}
      />
    );
  };
  getCircleFields = () => {
    return (
      <Circle
        show={this.state.show}
        onHide={this.modalClose}
        onSubmit={this.onSubmit}
      />
    );
  };
  getPeriodFields = () => {
    return (
      <Period
        show={this.state.show}
        onHide={this.modalClose}
        onSubmit={this.onSubmit}
      />
    );
  };

  // Submit data with modal
  modalClose = () => this.setState({ show: false });

  modalOn = () => this.setState({ show: true });

  onSubmitModal = () => {
    if (this.state.type_run === 'exposure') {
      this.onSubmit();
    }
    if (this.state.type_run === 'period') {
      this.modalOn();
    }
    if (this.state.type_run === 'circle') {
      this.modalOn();
    }
    if (this.state.type_run === 'square') {
      this.modalOn();
    }
  };

  // Check the status to display the button
  onVisibleSubmit = () => {
    if (this.state.type_run) {
      return (
        <Button
          onClick={this.onSubmitModal}
          style={{ width: '120px' }}
          label="Run"
        />
      );
    } else {
      <Button
        onClick={this.onSubmitModal}
        disabled={!false}
        style={{ width: '120px' }}
        label="Run"
      />;
    }
  };
  //ur, ul, lr, ll
  onSubmit = () => {
    console.log(this.state);
    const {
      start,
      final,
      exposure,
      date_initial,
      date_final,
      type_run,
      ra_cent,
      dec_cent,
      radec_ur,
      radec_ul,
      radec_lr,
      radec_ll,
    } = this.state;
    this.skybotApi
      .createSkybotRun({
        start: start,
        final: final,
        exposure: exposure,
        date_initial: date_initial,
        date_final: date_final,
        type_run: type_run,
        ra_cent: ra_cent,
        dec_cent: dec_cent,
        ra_ur: radec_ur,
        ra_ul: radec_ul,
        ra_lr: radec_lr,
        ra_ll: radec_ll,
      })
      .then(res => {
        this.props.insertHistory(res);
        console.log('Then: ', res.data);
        alert('successful round');
      })
      .catch(error => {
        console.log('Catch: ', error);
        alert('not successful round');
      });
    this.modalClose();
  };

  render() {
    return (
      <Content
        title="Selected a configuration for option picked"
        header={true}
        className="content-skybot"
        content={
          <div className="p-grid p-grid-row">
            <div className="p-col-6">
              <Dropdown
                value={this.state.type_run}
                options={this.options}
                style={{ width: '200px' }}
                onChange={e => {
                  this.setState({ type_run: e.value });
                }}
                placeholder="Select a option"
              />
            </div>
            <div className="p-col-6">{this.onVisibleSubmit()}</div>
            {this.state.type_run === 'period' ? this.getPeriodFields() : <p />}
            {this.state.type_run === 'square' ? this.getSquareFields() : <p />}
            {this.state.type_run === 'circle' ? this.getCircleFields() : <p />}
          </div>
        }
      />
    );
  }
}

export default FormSkybot;
