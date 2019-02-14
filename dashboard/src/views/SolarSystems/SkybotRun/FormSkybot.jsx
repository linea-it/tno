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
    // ra_ul: null,
    // ra_ur: null,
    // ra_lr: null,
    // ra_ll: null,
    // dec_ul: null,
    // dec_ur: null,
    // dec_lr: null,
    // dec_ll: null,
  };

  options = [
    { label: 'Exposure', value: 'all' },
    { label: 'Period', value: 'period' },
    { label: 'Square', value: 'square' },
    { label: 'Circle', value: 'circle' },
  ];

  // Visible Modal
  handleShow = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  // Methods with content modal
  getSquareFields = () => {
    return <Square onVisible={this.state.show} onHide={this.state.show} />;
  };
  getCircleFields = () => {
    return <Circle onVisible={this.state.show} onHide={this.state.show} />;
  };
  getPeriodFields = () => {
    return <Period onVisible={this.state.show} onHide={this.state.show} />;
  };

  // Submit data with modal
  onSubmitModal = () => {
    if (this.state.type_run === 'exposure') {
      return this.onSubmit();
    } else {
      if (this.state.type_run === 'period') {
        this.handleShow();
      } else {
        this.handleShow();
      }
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
  // submit the data
  onSubmit = () => {
    console.log(`submeti ${this.state.type_run}`);
  };
  // onSubmit = () => {
  //   const {
  //     start,
  //     final,
  //     exposure,
  //     date_initial,
  //     date_final,
  //     type_run,
  //     ra_cent,
  //     dec_cent,
  //     ra_ul,
  //     ra_ur,
  //     ra_lr,
  //     ra_ll,
  //     dec_ul,
  //     dec_ur,
  //     dec_lr,
  //     dec_ll,
  //   } = this.state;
  //   this.skybotApi
  //     .createSkybotRun({
  //       start: start,
  //       final: final,
  //       exposure: exposure,
  //       date_initial: date_initial,
  //       date_final: date_final,
  //       type_run: type_run,
  //       ra_cent: ra_cent,
  //       dec_cent: dec_cent,
  //       ra_ul: ra_ul,
  //       ra_ur: ra_ur,
  //       ra_lr: ra_lr,
  //       ra_ll: ra_ll,
  //       dec_ul: dec_ul,
  //       dec_ur: dec_ur,
  //       dec_lr: dec_lr,
  //       dec_ll: dec_ll,
  //     })
  //     .then(res => {
  //       this.props.insertHistory(res);
  //       console.log('Then: ', res.data);
  //       alert('successful round');
  //     })
  //     .catch(error => {
  //       console.log('Catch: ', error);
  //       alert('not successful round');
  //     });
  // };

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
