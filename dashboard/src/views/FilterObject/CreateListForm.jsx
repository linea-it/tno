import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Checkbox, Modal } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';

class CreateListForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      formValid: false,
      nameState: null,
      descriptionState: null
    };
  }

  validName = (e) => {

    this.setState({ name: e.target.value })

    if ((e.target.value.length > 40) || (e.target.value.length == '')) {
      this.setState({ nameState: 'error' })
    } else {
      this.setState({ nameState: 'success' })
    }

    this.validForm();
  };

  validDescription = (e) => {

    this.setState({ description: e.target.value })

    if ((e.target.value.length == 0) || (e.target.value.length == '')) {
      this.setState({ descriptionState: 'error' })
    } else {
      this.setState({ descriptionState: 'success' })
    }

    this.validForm()
  };

  validForm = () => {
    if ((this.state.nameState == 'success') && (this.state.descriptionState == 'success')) {
      this.setState({ formValid: true })
    } else {
      this.setState({ formValid: false })
    }
  };

  onSubmit = (e) => {
    console.log('onSubmit')
  }

  render() {
    return (
      <Modal
          {...this.props}
        >
        <Modal.Header closeButton>
          <Modal.Title>Save</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Save this result to a new table.
          </p>
          <form>
            <FormGroup
                bsSize="small"
                validationState={this.state.nameState}
              >
              <ControlLabel>Name</ControlLabel>
              <FormControl
                  type="text"
                  value={this.state.name}
                  onChange={this.validName}
                />
            </FormGroup>
            <FormGroup
              bsSize="small"
              validationState={this.state.descriptionState}
              >
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                value={this.state.description}
                onChange={this.validDescription} />
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            // disabled={!this.state.formValid}
            onClick={this.onSubmit}
            >Submit</Button>
          <Button onClick={ this.props.onHide }>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateListForm;
