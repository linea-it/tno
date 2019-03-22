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
    date_initial: '',
    date_final: '',
    type_run: '',
    radius: 0,
    ra_cent: null,
    dec_cent: null,
    radec_ul: '',
    radec_ur: '',
    radec_ll: '',
    radec_lr: '',
  };

  radec = (ur, ul, lr, ll) => {
    this.setState(
      { radec_ur: ur, radec_ul: ul, radec_lr: lr, radec_ll: ll },
      () => {
        this.onSubmit();
      }
    );
  };

  circle = (ra_cent, dec_cent, radius) => {
    this.setState(
      { ra_cent: ra_cent, dec_cent: dec_cent, radius: radius },
      () => {
        this.onSubmit();
      }
    );
  };

  dates = (date_initial, date_final) => {
    console.log('caiu aqui', date_initial, date_final);
    this.setState(
      { date_initial: date_initial, date_final: date_final },
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

  onClear = () => {
    this.setState({ dateInitial: '', dateFinal: '' });
  };

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
        circle={this.circle}
      />
    );
  };
  getPeriodFields = () => {
    return (
      <Period
        show={this.state.show}
        onHide={this.modalClose}
        dates={this.dates}
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
      return (
        <Button
          onClick={this.onSubmitModal}
          disabled={!false}
          style={{ width: '120px' }}
          label="Run"
        />
      );
    }
  };
  //ur, ul, lr, ll
  onSubmit = () => {
    this.onClear();
    console.log(this.state);
    const {
      start,
      final,
      exposure,
      date_initial,
      date_final,
      type_run,
      ra_cent,
      radius,
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
        radius: radius,
        ra_ur: radec_ur,
        ra_ul: radec_ul,
        ra_lr: radec_lr,
        ra_ll: radec_ll,
        dec_ur: radec_ur,
        dec_ul: radec_ul,
        dec_lr: radec_lr,
        dec_ll: radec_ll,
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
