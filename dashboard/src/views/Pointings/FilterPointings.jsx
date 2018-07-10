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
};

class FilterPointings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      band: '',
    };
  }

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  handleSelectChange = value => {
    this.setState({ band: value });
  };

  handlerSubmitFilter = event => {
    // passa para o parent por props

    const filters = [];

    if (this.state.band) {
      filters.push({
        property: 'band__in=',
        value: this.state.band,
      });
      //console.log('eu sou o filter da filterPointings: %o', filters);
      this.props.onFilter(this.state);
    }
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
                      <FormControl
                        onChange={this.handleSelectChange}
                        componentClass="select"
                        placeholder="select"
                      >
                        <option value="select"> 0 - 100</option>
                        <option value="other">100 - 150</option>
                        <option value="other">150 - 200</option>
                        <option value="other">200 - 250</option>
                        <option value="other">300 - 360</option>
                      </FormControl>
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
                        onChange={this.handleSelectChange}
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
