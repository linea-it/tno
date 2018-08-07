import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

class Log extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    id: PropTypes.any.isRequired,
  };

  render() {
    const { visible, onHide, id } = this.props;
    return (
      <Dialog
        header=" Log Object:Godfather I"
        visible={visible}
        width="350px"
        modal={true}
        //e => this.setState({ visible: false })
        onHide={onHide}
        style={{ backgroundColor: '#000', width: 900 + 'px' }}
      >
        <pre
          style={{
            color: '#00ff00',
            backgroundColor: '#000',
            height: 600 + 'px',
          }}
        >
          <code>
            <ul style={{ listStyle: 'none' }}>
              <li>
                "Records": {id.id}
                <ul style={{ listStyle: 'none' }}>
                  <li> "type": "{id.input_displayname}",</li>
                  {/* <li> "principalId": "{id.}",</li> */}
                  <li> "arn": "arn:aws:iam::123456789012:user/Alice",</li>
                  <li> "accountId": "123456789012",</li>
                </ul>
              </li>
              <li> "eventSource": "cloudtrail.amazonaws.com", </li>
            </ul>
          </code>
        </pre>
      </Dialog>
    );
  }
}

export default Log;
