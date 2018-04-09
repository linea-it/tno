import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import 'assets/css/login.css';

class Login extends Component {
  state = {
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

  handleSubmit = event => {
    event.preventDefault();
  };

  render() {
    return (
      <div className="wrapper">
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
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }
}
export default Login;
