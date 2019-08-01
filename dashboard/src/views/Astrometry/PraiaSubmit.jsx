import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel } from 'react-bootstrap';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import ObjectApi from '../ObjectList/ObjectApi';
import PraiaApi from './PraiaApi';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';

class PraiaSubmit extends Component {
  state = this.initialState;

  object_api = new ObjectApi();
  praia_api = new PraiaApi();

  get initialState() {
    return { input: null, config: null, catalog: null };
  }

  static propTypes = {
    onCreateRun: PropTypes.func.isRequired,
  };


  componentDidMount() {

  }

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
        this.setState({ config: configs[0].id });
        return { options: configs };
      });
  };

  loadCatalogs = inputValue => {
    return this.praia_api.getCatalogs({ search: inputValue }).then(res => {
      const catalogs = res.data.results;
      this.setState({ catalog: catalogs[0].id });
      return { options: catalogs };
    });
  };

  onSelectConfig = selected => {
    if (selected) {
      this.setState({ config: selected.id });
    } else {
      this.setState({ config: null });
    }
  };

  onSelectCatalog = selected => {
    if (selected) {
      this.setState({ catalog: selected.id });
    } else {
      this.setState({ catalog: null });
    }
  };

  onClickSubmit = () => {

    const { input, config, catalog } = this.state;

    if (!input || !config || !catalog) {
      // TODO: Implementar notifacao de parametro faltante

      if (!input)
        this.props.onMissingParameter("Input");

      if (!config)
        this.props.onMissingParameter("Configuration");

      if (!catalog)
        this.props.onMissingParameter("Catalog");

      return;
    }

    this.praia_api
      .createPraiaRun({ input: input, config: config, catalog: catalog })
      .then(res => {

        this.onCreateSuccess(res.data);

      })
      .catch(error => {

        this.onCreateFailure(error);
      });
  };

  onCreateSuccess = record => {

    this.setState(this.initialState, this.props.onCreateRun(record));

  };

  onCreateFailure = error => {
    // TODO: Criar uma Notificacao de falha.
    this.props.onCreateFailure(error);

  };

  render() {
    const { input, config, catalog } = this.state;

    return (
      <Card className="none">
        <Form>
          <FormGroup>
            <ControlLabel>Input Object List</ControlLabel>
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
            <ControlLabel>Reference Catalog</ControlLabel>
            <Async
              onChange={this.onSelectCatalog}
              value={catalog}
              cacheOptions
              valueKey="id"
              labelKey="display_name"
              defaultOptions
              loadOptions={this.loadCatalogs}
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
          </FormGroup>


        </Form>
        <Button
          className="button-TNO"
          label="Submit"
          onClick={this.onClickSubmit}
          style={{ marginTop: '25px !important' }}
        />
      </Card>
    );
  }
}

export default PraiaSubmit;
