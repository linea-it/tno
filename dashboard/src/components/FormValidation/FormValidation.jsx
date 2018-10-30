import React, { Component } from 'react';

export class FormValidation extends Component {
  render() {
    const propSet = this.props;

    return (
      <div>
        <div className={`main-validation ${propSet.display} ${propSet.type}`}>
          <p>{propSet.text}</p>
        </div>
      </div>
    );
  }
}

export default FormValidation;
