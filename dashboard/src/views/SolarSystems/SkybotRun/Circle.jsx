import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';

class Square extends React.Component {
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
              <p />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="OK"
            style={{ width: '120px' }}
            onClick={this.props.onHide}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
