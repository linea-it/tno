import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Modal,
} from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';
import axios from 'axios';

const api = process.env.REACT_APP_API;

class CreateListForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: '',
      tablename: '',
      validName: false,
      nameValidationState: null,
      nameHelpBlock: '',
    };

    this.handleChangeName = this.handleChangeName.bind(this);
  }

  handleChangeName(event) {
    this.setState(
      { displayName: event.target.value },
      this.checkName(event.target.value)
    );
  }

  checkName(displayname) {
    const tablename = displayname
      .replace(/\s/gi, '_')
      .trim()
      .toLowerCase();
    if (tablename.length > 3) {
      if (tablename.length >= 40) {
        this.setState({
          tablename: '',
          validName: false,
          nameValidationState: 'error',
          nameHelpBlock: 'maximum of 40 characters',
        });
      } else {
        // Verificar se tabela ja existe
        axios
          .get(`${api}/customlist/`, {
            params: {
              tablename: tablename,
            },
          })
          .then(res => {
            var r = res.data;
            if (r.count == 0) {
              // Nao existe nenhuma tabela com mesmo nome.
              this.setState({
                tablename: tablename,
                validName: true,
                nameValidationState: 'success',
                nameHelpBlock: '',
              });
            } else {
              this.setState({
                tablename: '',
                validName: false,
                nameValidationState: 'error',
                nameHelpBlock: 'There is already a table with this name.',
              });
            }
          });
      }
    } else {
      this.setState({
        tablename: '',
        validName: false,
        nameValidationState: 'error',
        nameHelpBlock: 'minimum of 3 characters',
      });
    }
  }

  // validName = (e) => {

  //   this.setState({ name: e.target.value })

  //   if ((e.target.value.length > 40) || (e.target.value.length == '')) {
  //     this.setState({ nameState: 'error' })
  //   } else {
  //     this.setState({ nameState: 'success' })
  //   }

  //   this.validForm();
  // };

  // validDescription = (e) => {

  //   this.setState({ description: e.target.value })

  //   if ((e.target.value.length == 0) || (e.target.value.length == '')) {
  //     this.setState({ descriptionState: 'error' })
  //   } else {
  //     this.setState({ descriptionState: 'success' })
  //   }

  //   this.validForm()
  // };

  // validForm = () => {
  //   if ((this.state.nameState == 'success') && (this.state.descriptionState == 'success')) {
  //     this.setState({ formValid: true })
  //   } else {
  //     this.setState({ formValid: false })
  //   }
  // };


  render() {
    return (
      <Modal {...this.props}>
        <Modal.Header closeButton>
          <Modal.Title>Save list</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
          Save this result to a new table..
          </p>
          <Form>
            <FormGroup validationState={this.state.nameValidationState}>
              <ControlLabel>Name</ControlLabel>
              <FormControl
                type="text"
                placeholder="Table Display Name"
                value={this.state.displayName}
                onChange={this.handleChangeName}
              />
              <HelpBlock>{this.state.nameHelpBlock}</HelpBlock>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Table Name</ControlLabel>
              <FormControl.Static>{this.state.tablename}</FormControl.Static>
            </FormGroup>
            <FormGroup controlId="formControlsTextarea">
              <ControlLabel>Description</ControlLabel>
              <FormControl componentClass="textarea" placeholder="" />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
          <Button onClick={this.props.onSave} disabled={!this.state.validName}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateListForm;
