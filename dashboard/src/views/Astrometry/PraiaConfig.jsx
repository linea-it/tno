import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Tabs,
  Tab,
} from 'react-bootstrap';

class PraiaConfig extends Component {
  state = this.initialState;

  get initialState() {
    return {};
  }

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    return (
      <div className="content">
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
                  <FormControl type="text" placeholder="Valor do Parametro 1" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Param 2</ControlLabel>{' '}
                  <FormControl type="text" placeholder="Valor do Parametro 2" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Param 3</ControlLabel>{' '}
                  <FormControl type="text" placeholder="Valor do Parametro 3" />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Param 4</ControlLabel>{' '}
                  <FormControl type="text" placeholder="Valor do Parametro 4" />
                </FormGroup>
              </Form>
            </Tab>
          </Tabs>
          <Button type="submit">Save Configuration</Button>
        </Panel>
      </div>
    );
  }
}

export default PraiaConfig;
