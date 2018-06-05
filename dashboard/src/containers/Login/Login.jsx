import React, { Component } from 'react';
import {
  Grid,
  Row,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import Button from 'elements/CustomButton/CustomButton.jsx';
import Card from 'components/Card/Card';
import { login } from 'auth';

import { withRouter } from 'react-router-dom';

import 'assets/css/bootstrap.min.css';
import 'assets/sass/light-bootstrap-dashboard.css';
import 'assets/css/login.css';

class Login extends Component {
  state = {
    from: '/',
    username: '',
    password: '',
  };

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value,
    });
  };

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  onKeyPress = event => {
    console.log('onKeyPress')
    if (event.charCode == 13 && this.validateForm()) {
      this.submit();
    }
  };

  handleSubmit = event => {
    event.preventDefault();
    this.submit();
  };

  submit = () => {
    console.log('submit')
    if (this.validateForm()){
      login(this.state.username, this.state.password, loggedIn => {
        if (loggedIn) {
          this.props.history.push('/');
        }
      });
    }
  };
  
  render() {
    return (
      <div className="Login content col-sm-4 col-sm-offset-4">
        <Grid fluid>
          <Row>
            <Card
              hCenter
              title="TNO"
              category="Description "
              content={
                <form>
                  <FormGroup>
                    <ControlLabel>User</ControlLabel>
                    <FormControl
                      type="text"
                      id="username"
                      value={this.state.username}
                      onChange={this.handleChange}
                      autoFocus
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                      type="text"
                      id="password"
                      value={this.state.password}
                      onChange={this.handleChange}
                      onKeyPress={this.onKeyPress}
                    />
                  </FormGroup>
                  <Button
                    bsStyle="info"
                    fill
                    block
                    disabled={!this.validateForm()}
                    onClick={this.handleSubmit}
                  >
                    Login
                  </Button>
                </form>
              }
            />
          </Row>
        </Grid>
      </div>
    );
  }
}
export default withRouter(Login);
