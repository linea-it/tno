import React, { Component } from 'react';
import { FormGroup, ControlLabel, Checkbox, Modal } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';

class CreateListForm extends React.Component {
  render() {
    return (
      <Modal
          {...this.props}
        >
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Text in a modal</h4>
          <p>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </p>
          <h4>Overflowing text to show scroll behavior</h4>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={ this.props.onHide }>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateListForm;
