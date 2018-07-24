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
      value: 'g',
      label: 'g',
    },
    {
      value: 'r',
      label: 'r',
    },
    {
      value: 'i',
      label: 'i',
    },
    {
      value: 'z',
      label: 'z',
    },
    {
      value: 'Y',
      label: 'Y',
    },
    {
      value: 'u',
      label: 'u',
    },    
  ],

  valueTimes: [
    {
      value: '0, 100',
      label: '0 - 100',
    },
    {
      value: '100, 200',
      label: '100 - 200',
    },
    {
      value: '200, 300',
      label: '200 - 300',
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
      validation: null,
      controlId: null,
      errorMessage: null,
      colorAlert: null,
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

  ErroDate = () => {
    this.setState({ validation: 'warning' });
    this.setState({ controlId: 'formValidationWarning4' });
    this.setState({
      errorMessage: 'Start date can not be greater than end date',
    });
    this.setState({ colorAlert: 'warning' });
    this.setState({ open: true });
  };

  ErroEmpty = () => {
    this.setState({ validation: 'error' });
    this.setState({ controlId: 'formValidationerror4' });
    this.setState({
      errorMessage: 'Empty fields, please fill in some search field ',
    });
    this.setState({ colorAlert: 'danger' });
    this.setState({ open: true });
  };

  ErroReset = () => {
    this.setState({ validation: null });
    this.setState({ controlId: null });
    this.setState({
      errorMessage: null,
    });
    this.setState({ colorAlert: null });
    this.setState({ open: false });
  };

  onClear = () => {
    this.setState(this.getInitialState());
    this.setState({ open: false });
  };

  handlerSubmitFilter = () => {
    const dt1 = this.state.dateObserInit;
    const dt2 = this.state.dateObserFinal;
    const comp1 = new Date(dt1);
    const comp2 = new Date(dt2);

    if (
      this.state.expTime === '' &&
      this.state.band === '' &&
      this.state.dateObserInit === '' &&
      this.state.dateObserFinal === ''
    ) {
      this.ErroEmpty();
    } else {
      if (comp1 > comp2) {
        this.ErroDate();
      } else {
        this.setState({ validation: null });
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
        this.props.onFilter(filter);
      }
    }

    this.setState({ state: this.getInitialState });
  };

  onClose = () => {
    this.props.onHide();
    this.setState({ open: false });
    this.ErroReset();
  };

  render() {
    const { show, onHide } = this.props;

    return (
      <div className="static-modal">
        <Modal show={show} onHide={onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Filter Pointings</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup
                      controlId="formValidationError2"
                      validationState={this.state.validation}
                    >
                      <ControlLabel>Exposure Time</ControlLabel>
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
                    <FormGroup
                      controlId="formValidationError2"
                      validationState={this.state.validation}
                    >
                      <ControlLabel>Date de Observation Initial</ControlLabel>

                      <FormControl
                        className="form-control"
                        type="date"
                        value={this.state.dateObserInit}
                        onChange={this.handlerInputDateInit}
                        format="yyyy/mm/dd"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup
                      controlId={this.state.controlId}
                      validationState={this.state.validation}
                    >
                      <ControlLabel>Date de Observation Final</ControlLabel>

                      <FormControl
                        className="form-control"
                        type="date"
                        value={this.state.dateObserFinal}
                        onChange={this.handlerInputDateFinal}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>

              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup
                      controlId={this.state.controlId}
                      validationState={this.state.validation}
                    >
                      <ControlLabel>Band</ControlLabel>

                      <Select
                        disabled={false}
                        multi
                        onChange={this.handleSelectBand}
                        options={options.band}
                        placeholder="Select one or more values of band"
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
                <Collapse in={this.state.open}>
                  <div>
                    <Alert bsStyle={this.state.colorAlert}>
                      {this.state.errorMessage}
                    </Alert>
                  </div>
                </Collapse>
              </Row>
            </Grid>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.handlerSubmitFilter}>Filter</Button>
            <Button onClick={this.onClear}>Clear</Button>
            <Button onClick={this.onClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterPointings;
