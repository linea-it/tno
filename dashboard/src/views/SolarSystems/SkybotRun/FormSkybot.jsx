import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import Content from 'components/CardContent/CardContent.jsx';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { FormValidation } from 'components/FormValidation/FormValidation.jsx';
import SkybotApi from '../SkybotApi';
import { Dropdown } from 'primereact/dropdown';

class FormSkybot extends Component {
  skybotApi = new SkybotApi();
  state = {
    visiblePeriod: false,
    visibleArea: false,
    show: true,
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
    ra_ul: null,
    ra_ur: null,
    ra_lr: null,
    ra_ll: null,
    dec_ul: null,
    dec_ur: null,
    dec_lr: null,
    dec_ll: null,
  };

  options = [
    { label: 'Exposure', value: 'all' },
    { label: 'Period', value: 'period' },
    { label: 'Square', value: 'square' },
    { label: 'Circle', value: 'circle' },
  ];

  handleShow = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  getPeriodFields = () => {
    const { type_run } = this.state;

    if (type_run === 'period') {
      return (
        <div>
          <Calendar
            placeholder="Select a date initial"
            value={this.state.date_initial}
            onChange={e => this.setState({ date_initial: e.value })}
          />{' '}
          <Calendar
            placeholder="Select a date final"
            value={this.state.date_final}
            onChange={e => this.setState({ date_final: e.value })}
          />
          <br />
          <br />
        </div>
      );
    } else {
      return null;
    }
  };

  getAreaFields = () => {
    const { type_run } = this.state;
    console.log(type_run);
    if (type_run === 'square' || type_run === 'circle') {
      return (
        <div className="p-grid">
          <div className="p-col-6">
            <br />
            <label htmlFor="in">RA UL</label>
            <br />
            <InputText
              id="in"
              value={this.state.ra_ul}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">RA UR</label>
            <br />
            <InputText
              id="in"
              value={this.state.ra_ur}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">RA LR</label>
            <br />
            <InputText
              id="in"
              value={this.state.ra_lr}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">RA LL</label>
            <br />
            <InputText
              id="in"
              value={this.state.ra_ll}
              onChange={e => this.setState({ value: e.target.value })}
            />
          </div>
          <div className="p-col-6">
            <br />
            <label htmlFor="in">RA UL</label>
            <br />
            <InputText
              id="in"
              value={this.state.dec_ul}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">DEC UR</label>
            <br />
            <InputText
              value={this.state.dec_ur}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">DEC LR</label>
            <br />
            <InputText
              value={this.state.dec_lr}
              onChange={e => this.setState({ value: e.target.value })}
            />
            <br />
            <br />
            <label htmlFor="in">DEC LL</label>
            <br />
            <InputText
              value={this.state.dec_ll}
              onChange={e => this.setState({ value: e.target.value })}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  };

  onSubmitModal = () => {
    this.onSubmit();
    this.handleHide();
  };

  onSubmit = () => {
    this.handleShow();
    const {
      start,
      final,
      exposure,
      date_initial,
      date_final,
      type_run,
      ra_cent,
      dec_cent,
      ra_ul,
      ra_ur,
      ra_lr,
      ra_ll,
      dec_ul,
      dec_ur,
      dec_lr,
      dec_ll,
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
        ra_ul: ra_ul,
        ra_ur: ra_ur,
        ra_lr: ra_lr,
        ra_ll: ra_ll,
        dec_ul: dec_ul,
        dec_ur: dec_ur,
        dec_lr: dec_lr,
        dec_ll: dec_ll,
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
  };

  render() {
    console.log('RA UL:', this.state.ra_ul);
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

            {this.state.type_run === 'period' ? (
              <div>
                <Modal
                  show={this.state.show}
                  onHide={this.handleHide}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Selected a configuration for option picked
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{this.getPeriodFields()}</Modal.Body>
                  <Modal.Footer>
                    <Button
                      label="OK"
                      style={{ width: '120px' }}
                      onClick={this.onSubmitModal}
                    />
                  </Modal.Footer>
                </Modal>
                <div className="p-col-6">
                  <Button
                    label="Run"
                    onClick={this.handleShow}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            ) : this.state.type_run === 'square' ||
            this.state.type_run === 'circle' ? (
              <div>
                <Modal
                  show={this.state.show}
                  onHide={this.handleHide}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Fill in the fields of the coordinates
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{this.getAreaFields()}</Modal.Body>
                  <Modal.Footer>
                    <Button
                      label="OK"
                      style={{ width: '120px' }}
                      onClick={this.onSubmitModal}
                    />
                  </Modal.Footer>
                </Modal>
                <div className="p-col-6">
                  <Button
                    label="Run"
                    onClick={this.handleShow}
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-col-6">
                <Button
                  onClick={this.onSubmit}
                  style={{ width: '120px' }}
                  label="Run"
                />
              </div>
            )}
          </div>
        }
      />
    );
  }
}

export default FormSkybot;
