import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';



export default class Log extends Component {


    state = { textLog: [] }

    render() {
        const { visible, onHide, content, header } = this.props;


        const arrayLines = [];
        if (content) {

            content.forEach((line, idx) => {
                arrayLines.push(<div key={idx}>{line}</div>)
            });
        }
        return (

            <Dialog
                header={header}
                visible={visible}
                width="650px"

                modal={true}
                onHide={onHide}
                maximizable={true}
                blockScroll={false}


                style={{
                    color: '#ffffff',
                    backgroundColor: '#254356',
                    width: 900 + 'px',
                    minHeight: 600 + 'px',


                }}
            >
                <pre
                    style={{
                        color: '#ffffff',
                        backgroundColor: '#254356',
                        border: 'none',
                        height: '100%',

                        // minHeight: '101%',
                    }}
                >
                    {arrayLines}
                </pre>

            </Dialog >

        );
    }


}