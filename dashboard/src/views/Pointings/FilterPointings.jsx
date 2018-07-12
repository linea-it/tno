import React from 'react';
import {
  Modal,
  Button,
  ControlLabel,
  FormGroup,
  Grid,
  Row,
  Col,
  Collapse,
  Alert,
  FormControl,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';

const options = {
  band: [
    {
      value: 'u',
      label: 'u',
    },
    {
      value: 'r',
      label: 'r',
    },
    {
      value: 'g',
      label: 'g',
    },
    {
      value: 'i',
      label: 'i',
    },
    {
      value: 'Y',
      label: 'Y',
    },
  ],

  valueTimes: [
    {
      value: '0, 100',
      label: '0 - 100',
    },
    {
      value: '100, 150',
      label: '100 - 200',
    },
    {
      value: '150, 200',
      label: '150 - 200',
    },
    {
      value: '200 , 250',
      label: '200 - 250',
    },
    {
      value: '250, 300',
      label: '250 - 300',
    },
    {
      value: '300, 400',
      label: '300 - 400',
    },
  ],
};

class FilterPointings extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState = () => {
    const initialState = {
      band: '',
      expTime: '',
      dateObserInit: '',
      dateObserFinal: '',
      open: true,
    };
    return initialState;
  };

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.setState({ open: false });
  }

  handleSelectBand = value => {
    this.setState({ band: value });
  };

  handleSelectExpTime = value => {
    this.setState({ expTime: value });
  };

  handlerInputDateInit = event => {
    this.setState({ dateObserInit: event.target.value });
  };

  handlerInputDateFinal = event => {
    this.setState({ dateObserFinal: event.target.value });
  };

  onClear = () => {
    this.setState(this.getInitialState());
    this.setState({ open: false });
  };

  handlerSubmitFilter = () => {
    if (
      this.state.expTime == '' &&
      this.state.band == '' &&
      this.state.dateObserInit == '' &&
      this.state.dateObserFinal == ''
    ) {
      this.setState({ open: true });
    } else {
      this.setState({ open: false });
      // passa para o parent por props
      const filter = [];

      if (this.state.band) {
        filter.push({ property: 'band__in', value: this.state.band });
      }

      if (this.state.expTime) {
        filter.push({
          property: 'exptime__range',
          value: this.state.expTime.value,
        });
      }

      if (this.state.dateObserFinal && this.state.dateObserFinal) {
        filter.push({
          property: 'date_obs__range',
          value: this.state.dateObserInit + ',' + this.state.dateObserFinal,
        });
      }

      if (this.state.dateObserInit && !this.state.dateObserFinal) {
        filter.push({
          property: 'date_obs__gt',
          value: this.state.dateObserInit,
        });
      }

      if (!this.state.dateObserInit && this.state.dateObserFinal) {
        filter.push({
          property: 'date_obs__lt',
          value: this.state.dateObserFinal,
        });
      }
      //console.log('eu sou o filter da filterPointings: %o', filter);
      this.props.onFilter(filter);

      // console.log('Onfilter o%', this.state.band);
    }

    this.setState({ state: this.getInitialState });
  };

  onClose = () => {
    this.props.onHide();
    this.setState({ open: false });
  };

  render() {
    const { show, onHide } = this.props;

    return (
      <div className="static-modal">
        <Modal show={show} onHide={onHide}>
          <Modal.Header>
            <Modal.Title>Filter Pointings</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup controlId="formControlsSelect">
                      <ControlLabel>Range of Expose Time</ControlLabel>
                      <Select
                        onChange={this.handleSelectExpTime}
                        options={options.valueTimes}
                        placeholder="Select your object table(s)"
                        value={this.state.expTime}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>

              <Grid fluid>
                <Row>
                  <Col md={6}>
                    <ControlLabel>Date de Observation Initial</ControlLabel>
                    <FormGroup>
                      <input
                        className="form-control"
                        type="date"
                        value={this.state.dateObserInit}
                        onChange={this.handlerInputDateInit}
                        format="yyyy/mm/dd"
                      />
                      <FormControl type="date" />
                      <p>{this.state.dateObserInit}</p>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <ControlLabel>Date de Observation Final</ControlLabel>
                    <FormGroup>
                      <input
                        className="form-control"
                        type="date"
                        value={this.state.dateObserFinal}
                        onChange={this.handlerInputDateFinal}
                      />
                      <p>{this.state.dateObserFinal}</p>
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>

              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup controlId="formControlsSelect">
                      <ControlLabel>Quantity of ccds per band</ControlLabel>
                      <Select
                        disabled={false}
                        multi
                        onChange={this.handleSelectBand}
                        options={options.band}
                        placeholder="Select your object table(s)"
                        removeSelected={true}
                        simpleValue
                        value={this.state.band}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>
            </form>
            <Grid fluid>
              <Row>
                <Collapse timeout="100" in={this.state.open}>
                  <div>
                    <Alert bsStyle="danger">
                      <strong>No values ​​found!</strong> Check some filter to
                      perform a search
                    </Alert>
                  </div>
                </Collapse>
              </Row>
            </Grid>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.handlerSubmitFilter}>Filter</Button>
            <Button onClick={this.onClear}>Clear Inputs</Button>
            <Button onClick={this.onClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterPointings;
