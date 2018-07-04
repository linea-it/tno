import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

class FilterSkybot extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  onClose = () => {
    this.props.onHide()
  };

  render() {
    const { show, onHide } = this.props;
    return (
      <div className="static-modal">
        <Modal show={show} onHide={onHide}>
          <Modal.Header>
            <Modal.Title>Modal title</Modal.Title>
          </Modal.Header>

          <Modal.Body>One fine body...</Modal.Body>

          <Modal.Footer>
            <Button onClick={this.onClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default FilterSkybot;
