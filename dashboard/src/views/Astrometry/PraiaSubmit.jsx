import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel } from 'react-bootstrap';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import ObjectApi from '../ObjectList/ObjectApi';
import PraiaApi from './PraiaApi';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import PanelCostumize from 'components/Panel/PanelCostumize';

class PraiaSubmit extends Component {
  state = this.initialState;

  object_api = new ObjectApi();
  praia_api = new PraiaApi();

  get initialState() {
    return { input: null, config: null };
  }

  static propTypes = {
    onCreateRun: PropTypes.func.isRequired,
  };

  loadInputs = inputValue => {
    return this.object_api
      .getListsByStatus({ status: 'success', search: inputValue })
      .then(res => {
        const inputs = res.data.results;
        return { options: inputs };
      });
  };

  onSelectInput = selected => {
    if (selected) {
      this.setState({ input: selected.id });
    } else {
      this.setState({ input: null });
    }
  };

  loadConfigs = inputValue => {
    return this.praia_api
      .getConfigurations({ search: inputValue, ordering: '-creation_date' })
      .then(res => {
        const configs = res.data.results;
        return { options: configs };
      });
  };

  onSelectConfig = selected => {
    if (selected) {
      this.setState({ config: selected.id });
    } else {
      this.setState({ config: null });
    }
  };

  onClickSubmit = () => {
    const { input, config } = this.state;
    if (!input || !config) {
      console.log('Falta um parametro');
      // TODO: Implementar notifacao de parametro faltante
      return;
    }
    this.praia_api
      .createPraiaRun({ input: input, config: config })
      .then(res => {
        console.log(res);
        this.onCreateSuccess(res.data);
      })
      .catch(this.onCreateFailure);
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
    const { input, config } = this.state;
    return (
      <PanelCostumize
        title="Execute"
        subTitle="Descrição sobre a execução"
        content={
          <Card className="none">
            <Form>
              <FormGroup>
                <ControlLabel>Input</ControlLabel>
                <Async
                  onChange={this.onSelectInput}
                  value={input}
                  cacheOptions
                  valueKey="id"
                  labelKey="displayname"
                  defaultOptions
                  loadOptions={this.loadInputs}
                />
              </FormGroup>
              <FormGroup>

                <ControlLabel>Configuration</ControlLabel>
                <Async
                  onChange={this.onSelectConfig}
                  value={config}
                  cacheOptions
                  valueKey="id"
                  labelKey="displayname"
                  defaultOptions
                  loadOptions={this.loadConfigs}
                />
                <Button className="button-TNO"label="Submit" onClick={this.onClickSubmit} style={{margin: '20px !important'}}/>
 
              </FormGroup>
            </Form>
          </Card>
        }
      />
    );
  }
}

export default PraiaSubmit;
