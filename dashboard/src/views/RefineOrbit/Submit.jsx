import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel } from 'react-bootstrap';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import PraiaApi from '../Astrometry/PraiaApi';
import OrbitApi from './OrbitApi';
import Content from 'components/CardContent/CardContent.jsx';
import PropTypes from 'prop-types';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';

class RefineOrbitSubmit extends Component {
  state = this.initialState;

  praia_api = new PraiaApi();
  orbit_api = new OrbitApi();

  get initialState() {
    return {
      input: null,
      record: null,
    };
  }

  static propTypes = {
    onCreateRun: PropTypes.func.isRequired,
  };

  loadInputs = inputValue => {
    return this.praia_api
      .getPraiaRuns({
        search: inputValue,
        ordering: '-start_time',
        filters: [
          {
            property: 'status',
            value: 'success',
          },
        ],
      })
      .then(res => {
        const configs = res.data.results;

        configs.forEach(function (el) {
          el['proccess_displayname'] =
            el.proccess + ' - ' + el.input_displayname;
        });

        return { options: configs };
      });
  };

  onSelectInput = selected => {
    if (selected) {
      this.setState({ input: selected.id, record: selected });
    } else {
      this.setState({ input: null });
    }
  };

  onClickSubmit = () => {
    const { record } = this.state;
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
        this.onCreateSuccess(res.data);
      })
      .catch(error => {
        this.onCreateFailure(error);
      });
  };

  onCreateSuccess = record => {
    console.log('onCreateSuccess(%o)', record);
    this.setState(this.initialState, this.props.onCreateRun(record));
  };

  onCreateFailure = error => {
    // TODO: Criar uma Notificacao de falha.
    console.log('onCreateFailure(%o)', error);
  };

  render() {
    const { input } = this.state;
    return (
      <div>
        <Content
          content={
            <div>
              <Form>
                <FormGroup>
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
                </FormGroup>
                <Button
                  label="Submit"
                  onClick={this.onClickSubmit}
                  className="button-TNO"
                />
              </Form>
            </div>
          }
        />
      </div>
    );
  }
}

export default RefineOrbitSubmit;
