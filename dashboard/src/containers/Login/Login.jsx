import React, { Component } from 'react';
import {
  Table,
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import Button from 'elements/CustomButton/CustomButton.jsx';
import Card from 'components/Card/Card';
import 'assets/css/bootstrap.min.css';
import 'assets/sass/light-bootstrap-dashboard.css';
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
                    />
                  </FormGroup>
                  <Button
                    bsStyle="info"
                    fill
                    block
                    // type="submit"
                    // bsSize="medium"
                    disabled={!this.validateForm()}
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
export default Login;
