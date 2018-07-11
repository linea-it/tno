import React from 'react';
import {
  Modal,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
  Grid,
  Row,
  Col,
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

    this.state = {
      band: '',
      expTime: '',
      dateObservation: '',
    };
  }

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  handleSelectBand = value => {
    this.setState({ band: value });
  };

  handleSelectExpTime = value => {
    this.setState({ expTime: value });
  };

  handleDateObservation = (initial, final) => {
    this.setState({ dateObservation: initial + ',' + final });
  };

  handlerSubmitFilter = () => {
    // passa para o parent por props
    const filter = [];

    if (this.state.band) {
      filter.push({ property: 'band__in', value: this.state.band });
    } else {
      if (this.state.expTime) {
        filter.push({
          property: 'exptime__range',
          value: this.state.expTime.value,
        });
      } else {
        filter.push({
          property: 'date_obs__joined__range',
          value: this.state.dateObservation,
        });
      }
    }

    console.log('eu sou o filter da filterPointings: %o', filter);
    this.props.onFilter(filter);
    // console.log('Onfilter o%', this.state.band);
  };

  onClose = () => {
    this.props.onHide();
  };

  render() {
    const { show, onHide } = this.props;
    return (
      <div className="static-modal">
        <Modal show={show} onHide={onHide}>
          <Modal.Header>
            <Modal.Title>Filter Skybot</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <form>
              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup controlId="formControlsSelect">
                      {/* <ControlLabel>Expose Time</ControlLabel> */}
                      <Select
                        //disabled={false}
                        onChange={this.handleSelectExpTime}
                        options={options.valueTimes}
                        //placeholder="Select your object table(s)"
                        // removeSelected={true}
                        //clearable
                        //simpleValue
                        //value={this.state.band}
                        value={this.state.expTime}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>

              <Grid fluid>
                <ControlLabel>Exposure Time</ControlLabel>
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <FormControl
                        id="formControlsText"
                        type="text"
                        placeholder="Write the value initial"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <FormControl
                        id="formControlsText"
                        type="text"
                        placeholder="Write the value finally"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>

              <Grid fluid>
                <Row>
                  <Col md={12}>
                    <FormGroup controlId="formControlsSelect">
                      <ControlLabel>Total Size for Band</ControlLabel>
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
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.onClose}>Close</Button>
            <Button onClick={this.handlerSubmitFilter}> Filter </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterPointings;
