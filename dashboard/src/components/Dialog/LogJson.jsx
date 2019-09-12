import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import JSONFormatter from 'json-formatter-js';


export default class Log extends Component {


  state = { textLog: [] }

  render() {
    const { visible, onHide, content, header } = this.props;

    let myJson = null;


    // myJson = JSON.parse(content);

    myJson = JSON.stringify(content);


    return (
      <div>
        <Dialog
          header={header}
          visible={visible}
          width="650px"
          modal={true}

          onHide={onHide}
          maximizable={true}
          blockScroll={false}

          style={{
            color: '#fff',
            backgroundColor: '#254356',
            width: 900 + 'px',
            minHeight: 600 + 'px',

          }}
        >

          <div
            style={{
              color: '#ffffff',
              backgroundColor: '#254356',
              border: 'none',
              height: '100%',

              // minHeight: '101%',
            }}
          >
            {/* <JSONFormatter
              theme='dark'
            > */}
            {myJson}
            {/* </JSONFormatter> */}
          </div>

        </Dialog >
      </div >

    );
  }


}