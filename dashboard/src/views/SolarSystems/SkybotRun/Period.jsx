import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';

class Square extends React.Component {
  state = {
    dateInitial: '',
    dateFinal: '',
  };

  onClick = () => {
    this.props.dates(this.state.dateInitial, this.state.dateFinal);
  };

  onClear = () => {
    this.setState({ dateInitial: '', dateFinal: '' });
  };

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        centered="true"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Fill in the fields of the coordinates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-grid">
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Data Inital</label>
              <br />
              <Calendar
                value={this.state.dateInitial}
                onChange={e => this.setState({ dateInitial: e.value })}
              />
            </div>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Data Final</label>
              <br />
              <Calendar
                value={this.state.dateFinal}
                onChange={e => this.setState({ dateFinal: e.value })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="OK"
            style={{ width: '120px' }}
            onClick={this.onClick}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
