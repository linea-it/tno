import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import Content from 'components/CardContent/CardContent.jsx';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Dropdown } from 'primereact/dropdown';

class FormSkybot extends Component {
  state = {
    visiblePeriod: false,
    visibleArea: false,
    opt: null,
    show: false,
    area: null,
    value: '',
  };

  optArea = [
    { label: 'Circle', value: 'Circle' },
    { label: 'Square', value: 'Square' },
  ];

  options = [
    { label: 'Exposure', value: 'exposure' },
    { label: 'Period', value: 'period' },
    { label: 'Area', value: 'area' },
  ];

  getPeriodFields = () => {
    const { opt } = this.state;

    if (opt === 'period') {
      return (
        <div>
          <br />
          <p>Selected a configuration for option picked</p>
          <Calendar
            placeholder="Select a date initial"
            value={this.state.date}
            onChange={e => this.setState({ date: e.value })}
          />
          <Calendar
            placeholder="Select a date final"
            value={this.state.date}
            onChange={e => this.setState({ date: e.value })}
          />
          <br />
          <br />
        </div>
      );
    } else {
      return null;
    }
  };

  handleShow = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };
  getAreaFields = () => {
    const { opt, area } = this.state;

    if (opt === 'area') {
      return (
        <div>
          <br />
          <p>Selected a configuration for option picked</p>
          <SelectButton
            value={area}
            options={this.optArea}
            style={{ fontSize: '1.2em' }}
            onChange={e => this.setState({ area: e.value })}
          />
          <br />
          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
          <br />

          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
          <br />

          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
          <br />

          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
          <br />

          <InputText
            id="in"
            value={this.state.value}
            onChange={e => this.setState({ value: e.target.value })}
          />
          <label htmlFor="in">Username</label>
          <br />

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

  render() {
    return (
      <Content
        header={false}
        className="content-skybot"
        content={
          <div className="p-grid p-grid-row">
            <div className="p-col-6">
              <Dropdown
                value={this.state.opt}
                options={this.options}
                style={{ width: '200px' }}
                onChange={e => {
                  this.setState({ opt: e.value });
                }}
                placeholder="Select a option"
              />
            </div>

            {this.state.opt === 'period' ? (
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
                      Modal heading
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{this.getPeriodFields()}</Modal.Body>
                  <Modal.Footer>
                    <Button
                      label="OK"
                      style={{ width: '120px' }}
                      onClick={this.handleShow}
                    />
                  </Modal.Footer>
                </Modal>
                <div className="p-col-6">
                  <Button
                    label="Run"
                    style={{ width: '120px' }}
                    onClick={this.handleShow}
                  />
                </div>
              </div>
            ) : this.state.opt === 'area' ? (
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
                      Modal heading
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>{this.getAreaFields()}</Modal.Body>
                  <Modal.Footer>
                    <Button
                      label="OK"
                      style={{ width: '120px' }}
                      onClick={this.handleShow}
                    />
                  </Modal.Footer>
                </Modal>
                <div className="p-col-6">
                  <Button
                    label="Run"
                    style={{ width: '120px' }}
                    onClick={this.handleShow}
                  />
                </div>
              </div>
            ) : (
              <div className="p-col-6">
                <Button style={{ width: '120px' }} label="Run" />
              </div>
            )}
          </div>
        }
      />
    );
  }
}

export default FormSkybot;
