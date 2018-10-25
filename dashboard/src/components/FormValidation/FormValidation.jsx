import React, { Component } from 'react';
import {
  NotificationContainer,
  NotificationManager,
} from 'react-notifications';
import { Button } from 'primereact/button';

export class FormValidation extends Component {
  createNotification = type => {
    return () => {
      switch (type) {
      case 'info':
          NotificationManager.info('Info message');
          break;
      case 'success':
        NotificationManager.success('Success message', 'Title here');
        break;
      case 'warning':
        NotificationManager.warning(
            'Warning message',
            'Close after 3000ms',
            3000
          );
          break;
      case 'error':
        NotificationManager.error('Error message', 'Click me!', 5000, () => {
              alert('callback');
          });
        break;
      }
    };
  };

  render() {
    // this.propSet = this.props;

    return (
      <div>
        <button
          className="btn btn-success"
          onClick={this.createNotification('success')}
        >
          Success
        </button>
        <NotificationContainer />
      </div>
    );
  }
}

export default FormValidation;
