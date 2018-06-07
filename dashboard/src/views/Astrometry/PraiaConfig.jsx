import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  ListGroup,
  ListGroupItem,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Tabs,
  Tab,
} from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
import { Tasks } from 'components/Tasks/Tasks.jsx';
class PraiaConfig extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {};
  }

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    return (
      <div className="content">
        <Card
          title=""
          category="Manage and monitor the rounds Praia"
          content={
            <Grid fluid>
              <Row>
                <Col md={12}>
                  <Panel>
                    <Panel.Heading>Run</Panel.Heading>
                    <Form inline>
                      <FormGroup>
                        <ControlLabel>Input</ControlLabel>{' '}
                        <FormControl
                          componentClass="select"
                          placeholder="Choose a Input"
                        >
                          <option value="select">....................</option>
                          <option value="other">...</option>
                        </FormControl>
                      </FormGroup>{' '}
                      <FormGroup>
                        <ControlLabel>Config</ControlLabel>{' '}
                        <FormControl
                          componentClass="select"
                          placeholder="Choose a Config"
                        >
                          <option value="select">....................</option>
                          <option value="other">...</option>
                        </FormControl>
                      </FormGroup>{' '}
                      <Button type="submit">Run</Button>
                    </Form>
                  </Panel>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Panel>
                    <Panel.Heading>Configuration</Panel.Heading>
                    <Tabs defaultActiveKey={1} animation={true}>
                      <Tab eventKey={1} title="Common">
                        <Grid fluid>
                          <Row>
                            <Col md={6}>
                              <Form className="custom-form">
                                <FormGroup>
                                  <ControlLabel>Param 1</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 1"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 2</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 2"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 3</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 3"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 4</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 4"
                                  />
                                </FormGroup>
                              </Form>
                            </Col>
                            <Col md={6}>
                              <Form className="custom-form">
                                <FormGroup>
                                  <ControlLabel>Param 1</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 1"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 2</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 2"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 3</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 3"
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <ControlLabel>Param 4</ControlLabel>{' '}
                                  <FormControl
                                    type="text"
                                    placeholder="Valor do Parametro 4"
                                  />
                                </FormGroup>
                              </Form>
                            </Col>
                          </Row>
                        </Grid>
                      </Tab>
                      <Tab eventKey={2} title="Advanced">
                        <Form className="custom-form">
                          <FormGroup>
                            <ControlLabel>Param 1</ControlLabel>{' '}
                            <FormControl
                              type="text"
                              placeholder="Valor do Parametro 1"
                            />
                          </FormGroup>
                          <FormGroup>
                            <ControlLabel>Param 2</ControlLabel>{' '}
                            <FormControl
                              type="text"
                              placeholder="Valor do Parametro 2"
                            />
                          </FormGroup>
                          <FormGroup>
                            <ControlLabel>Param 3</ControlLabel>{' '}
                            <FormControl
                              type="text"
                              placeholder="Valor do Parametro 3"
                            />
                          </FormGroup>
                          <FormGroup>
                            <ControlLabel>Param 4</ControlLabel>{' '}
                            <FormControl
                              type="text"
                              placeholder="Valor do Parametro 4"
                            />
                          </FormGroup>
                        </Form>
                      </Tab>
                    </Tabs>
                    <Button type="submit">Save Configuration</Button>
                  </Panel>
                </Col>
              </Row>
            </Grid>
          }
        />
      </div>
    );
  }
}

export default PraiaConfig;
