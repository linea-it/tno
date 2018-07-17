import React, { Component } from 'react';
import { Form, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Async } from 'react-select';
import 'react-select/dist/react-select.css';
import PraiaApi from '../Astrometry/PraiaApi';
import Card from 'components/Card/Card.jsx';
import PropTypes from 'prop-types';

class RefineOrbitSubmit extends Component {
  state = this.initialState;

  praia_api = new PraiaApi();

  get initialState() {
    return { input: null };
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
        return { options: configs };
      });
  };

  onSelectInput = selected => {
    if (selected) {
      this.setState({ input: selected.id });
    } else {
      this.setState({ input: null });
    }
  };

  // onClickSubmit = () => {
  //   const { input, config } = this.state;
  //   if (!input || !config) {
  //     console.log('Falta um parametro');
  //     // TODO: Implementar notifacao de parametro faltante
  //     return;
  //   }
  //   this.praia_api
  //     .createPraiaRun({ input: input, config: config })
  //     .then(res => {
  //       console.log(res);
  //       this.onCreateSuccess(res.data);
  //     })
  //     .catch(this.onCreateFailure);
  // };

  // onCreateSuccess = record => {
  //   console.log('onCreateSuccess(%o)', record);
  //   this.setState(this.initialState, this.props.onCreateRun(record));
  // };

  // onCreateFailure = error => {
  //   // TODO: Criar uma Notificacao de falha.
  //   console.log('onCreateFailure(%o)', error);
  // };

  render() {
    const { input } = this.state;
    return (
      <Card
        title="Execute"
        category="DESCRIÇÃO SOBRE A EXECUÇÃO"
        content={
          <div className="content">
            <Form>
              <FormGroup>
                <ControlLabel>Input</ControlLabel>
                <Async
                  onChange={this.onSelectInput}
                  value={input}
                  cacheOptions
                  valueKey="id"
                  labelKey="id"
                  defaultOptions
                  loadOptions={this.loadInputs}
                />
              </FormGroup>
              <Button bsStyle="info" onClick={this.onClickSubmit}>
                Submit
              </Button>
            </Form>
          </div>
        }
      />
    );
  }
}

export default RefineOrbitSubmit;
