import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';

class Square extends React.Component {
  state = {
    dateInitial: '',
    dateFinal: '',
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  handleSubmit = () => {
    this.props.handleSubmit(this.state.dateInitial, this.state.dateFinal);
  };

  onClear = () => {
    this.setState({ dateInitial: '', dateFinal: '' });
  };

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size="lg"
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        centered="true"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Query of all pointings by Period
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-grid">
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Initial Date</label>
              <br />
              <Calendar
                value={this.state.dateInitial}
                dateFormat="yy-mm-dd"
                onChange={e => this.setState({ dateInitial: e.value })}
                placeholder="yyyy-mm-dd"
              />
            </div>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Final Date</label>
              <br />
              <Calendar
                value={this.state.dateFinal}
                dateFormat="yy-mm-dd"
                onChange={e => this.setState({ dateFinal: e.value })}
                placeholder="yyyy-mm-dd"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="OK"
            style={{ width: '120px' }}
            onClick={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
