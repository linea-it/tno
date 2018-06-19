import React, { Component } from 'react';
import {
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import ObjectApi from '../ObjectList/ObjectApi';
import PraiaApi from './PraiaApi';

class PraiaSubmit extends Component {
  state = this.initialState;

  object_api = new ObjectApi();
  praia_api = new PraiaApi();

  get initialState() {
    return { input: null, config: null };
  }

  componentDidMount() {
    // console.log("Praia Config mount")
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

  render() {
    const { input, config } = this.state;
    return (
      <div className="content">
        <Panel>
          <Panel.Heading>Run</Panel.Heading>
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
            </FormGroup>{' '}
            <Button type="submit">Run</Button>
          </Form>
        </Panel>
      </div>
    );
  }
}

export default PraiaSubmit;
