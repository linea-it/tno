import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

class FormSkybot extends Component {
  render() {
    return (
      <div>
        <InputText
          id="in"
          // value={this.state.value}
          // onChange={e => this.setState({ value: e.target.value })}
        />
        <label htmlFor="in">Username</label>
        <Button label="Save" />
      </div>
    );
  }
}

export default FormSkybot;
