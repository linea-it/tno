import React from 'react';
import {
  Modal,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
  HelpBlock,
  Grid,
  Row,
  Col,
} from 'react-bootstrap';
import PropTypes from 'prop-types';

class FilterSkybot extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
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
                      <ControlLabel>Total Size for Band</ControlLabel>
                      <FormControl componentClass="select" placeholder="select">
                        <option value="select">u</option>
                        <option value="other">g</option>
                        <option value="other">r</option>
                        <option value="other">i</option>
                        <option value="other">z</option>
                        <option value="other">Y</option>
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
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={this.onClose}>Close</Button>
            <Button onClick={this.onClose}>Filter</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterSkybot;
