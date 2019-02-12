import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import Content from 'components/CardContent/CardContent.jsx';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import SkybotApi from '../SkybotApi';
import { Dropdown } from 'primereact/dropdown';

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
    status: null,
    exposure: 0,
    date_initial: null,
    date_final: null,
    type_run: '',
    ra_cent: null,
    dec_cent: null,
  };

  options = [
    { label: 'Exposure', value: 'all' },
    { label: 'Period', value: 'period' },
    { label: 'Square', value: 'Square' },
    { label: 'Circle', value: 'Circle' },
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
          &nbsp&nbsp
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
    if (type_run === 'Square' || type_run === 'Circle') {
      return (
        <div>
          <br />
          {/* <SelectButton
            value={type_run}
            options={this.optArea}
            style={{ fontSize: '1.2em' }}
            onChange={e => this.setState({ type_run: e.value })}
          />
          <br /> */}
          <label htmlFor="in">RA UL</label>
          <br />
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <br /> <br />
          <label htmlFor="in">DEC UL</label>
          <br />
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <br />
          <label htmlFor="in">RA UR</label>
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <br />
          <label htmlFor="in">DEC UR</label>
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <br />
          <label htmlFor="in">RA LR</label>
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <br />
          <label htmlFor="in">DEC LR</label>
          <InputText
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
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
    console.log('OnSubmit');
    const {
      start,
      final,
      status,
      exposure,
      date_initial,
      date_final,
      type_run,
      ra_cent,
      dec_cent,
    } = this.state;
    this.skybotApi
      .createSkybotRun({
        start: start,
        final: final,
        status: status,
        exposure: exposure,
        date_initial: date_initial,
        date_final: date_final,
        type_run: type_run,
        ra_cent: ra_cent,
        dec_cent: dec_cent,
      })
      .then(res => {
        this.props.insertHistory(res);
        alert('successful round');
      })
      .catch(alert('round not done successfully'));
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
            ) : this.state.type_run === 'Square' ||
            this.state.type_run === 'Circle' ? (
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
