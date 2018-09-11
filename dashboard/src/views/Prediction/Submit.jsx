import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import 'react-select/dist/react-select.css';
import Content from 'components/CardContent/CardContent.jsx';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
export class PredictionSubmit extends Component {
  state = this.initialState;

  get initialState() {
    return {
      input: null,
      record: null,
    };
  }

  onClickSubmit = () => {
    const { record } = this.state;
    console.log("onClick")
    if (!record) {
      // TODO: Implementar notifacao de parametro faltante
      return;
    }

    this.orbit_api
      .createOrbitRun({
        input_list: record.input_list,
        proccess: record.proccess,
      })
      .then(res => {
        // console.log(res);
        // this.onCreateSuccess(res.data);
      })
      .catch(this.onCreateFailure);
  };


  render() {
    const { input } = this.state;
    return (
      <div className="ui-g">
        <div className="ui-lg-12">
          <Content
            content={
              <div>
                <Form>
                  {/* <FormGroup>
                    <ControlLabel>Input</ControlLabel>
                    <Async
                      onChange={this.onSelectInput}
                      value={input}
                      cacheOptions
                      valueKey="id"
                      labelKey="proccess_displayname"
                      defaultOptions
                      loadOptions={this.loadInputs}
                    />
                  </FormGroup> */}
                  <Button
                    label="Submit"
                    onClick={this.onClickSubmit}
                    style={{ float: 'right' }}
                  />
                </Form>
              </div>
            }
          />
        </div>
      </div>
    );
  }
}

export default PredictionSubmit;
