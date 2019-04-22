import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';

class Square extends React.Component {
  state = {
    ra_cent: '',
    dec_cent: '',
    radius: '',
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  handleSubmit = () => {
    this.props.handleSubmit(
      this.state.ra_cent,
      this.state.dec_cent,
      this.state.radius
    );
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
            Query of all pointings within the circular region of the sky
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-grid">
            <div className="p-col-4">
              <br />
              <label htmlFor="in">RA (deg)</label>
              <br />
              <InputText
                value={this.state.ra_cent}
                onChange={e => this.setState({ ra_cent: e.target.value })}
              />
            </div>
            <div className="p-col-4">
              <br />
              <label htmlFor="in">Dec (deg)</label>
              <br />
              <InputText
                value={this.state.dec_cent}
                onChange={e => this.setState({ dec_cent: e.target.value })}
              />
            </div>
            <div className="p-col-3">
              <br />
              <label htmlFor="in">RADIUS (deg)</label>
              <br />
              <InputText
                value={this.state.radius}
                onChange={e => this.setState({ radius: e.target.value })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="Submit"
            style={{ width: '120px' }}
            onClick={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
