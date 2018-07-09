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
import PointingApi from './PointingApi';

class FilterPointings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      useExptime: false,
      useBand: false,
      useDate: false,
    };
  }

  api = new PointingApi();

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  envia = valor => {
    console.log('To aqui');
    const band = valor;
    console.log(band);
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
                      <FormControl componentClass="select" placeholder="select">
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
                        onChange=""
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <FormControl
                        id="formControlsText"
                        type="text"
                        placeholder="Write the value finally"
                        onChange=""
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
                      <FormControl
                        componentClass="select"
                        placeholder="select"
                      >
                        <option value="u">u</option>
                        <option value="g">g</option>
                        <option value="r">r</option>
                        <option value="i">i</option>
                        <option value="z">z</option>
                        <option value="Y">Y</option>
                      </FormControl>
                    </FormGroup>
                  </Col>
                </Row>
              </Grid>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.onClose}>Close</Button>
            {/* <Button onClick={this.envia()}> Filter </Button> */}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterPointings;
