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
    date_initial: '',
    date_final: '',
    type_run: 'all',
    radius: null,
    ra_cent: null,
    dec_cent: null,
    radec_ul: '',
    radec_ur: '',
    radec_ll: '',
    radec_lr: '',
  };

  handleSquare = (ur, ul, lr, ll) => {
    this.setState(
      { radec_ur: ur, radec_ul: ul, radec_lr: lr, radec_ll: ll },
      () => {
        this.onSubmit();
      }
    );
  };

  handleCircle = (ra_cent, dec_cent, radius) => {
    this.setState(
      { ra_cent: ra_cent, dec_cent: dec_cent, radius: radius },
      () => {
        this.onSubmit();
      }
    );
  };

  handlePeriod = (date_initial, date_final) => {
    this.setState(
      { date_initial: date_initial, date_final: date_final },
      () => {
        this.onSubmit();
      }
    );
  };

  options = [
    { label: 'All Pointings', value: 'all' },
    { label: 'By Period', value: 'period' },
    { label: 'Region Selection', value: 'square' },
    { label: 'Cone Search ', value: 'circle' },
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
        handleSubmit={this.handleSquare}
      />
    );
  };
  getCircleFields = () => {
    return (
      <Circle
        show={this.state.show}
        onHide={this.modalClose}
        handleSubmit={this.handleCircle}
      />
    );
  };
  getPeriodFields = () => {
    return (
      <Period
        show={this.state.show}
        onHide={this.modalClose}
        handleSubmit={this.handlePeriod}
      />
    );
  };

  // Submit data with modal
  modalClose = () => this.setState({ show: false });

  modalOn = () => this.setState({ show: true });

  onSubmitModal = () => {
    if (this.state.type_run === 'all') {
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
    const {
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
        type_run: type_run,
        date_initial: date_initial,
        date_final: date_final,
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
      })
      .catch(error => {
        console.log('Catch: ', error);
      });
    this.modalClose();
  };

  render() {
    return (
      <Content
        title="Updates the Skybot outputs table."
        header={true}
        className="content-skybot"
        content={
          <div className="p-grid p-grid-row">
            <div className="p-col-6">
              <label htmlFor="skubot_run_type">
                Select the type of update.
              </label>
              <Dropdown
                id="skubot_run_type"
                value={this.state.type_run}
                options={this.options}
                style={{ width: '200px' }}
                onChange={e => {
                  this.setState({ type_run: e.value });
                }}
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
