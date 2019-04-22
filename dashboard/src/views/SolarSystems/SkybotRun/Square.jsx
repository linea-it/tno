import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';
class Square extends React.Component {
  state = {
    ur: '',
    ul: '',
    lr: '',
    ll: '',
  };

  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  handleSubmit = () => {
    this.props.handleSubmit(
      this.state.ur,
      this.state.ul,
      this.state.lr,
      this.state.ll
    );
  };
  render() {
    const { ur, ul, lr, ll } = this.state;
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size="lg"
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        centered="true"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Query of all pointings within a region.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-grid">
            <p>
              use &quot;,&quot; to separate the RA, Dec coordinates in degrees.
            </p>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Upper Left</label>
              <br />
              <InputText
                id="in"
                value={ul}
                onChange={e => this.setState({ ul: e.target.value })}
                placeholder="RA, Dec (deg)"
              />
              <br />
              <br />
              <label htmlFor="in">Lower Left</label>
              <br />
              <InputText
                id="in"
                value={ll}
                onChange={e => this.setState({ ll: e.target.value })}
                placeholder="RA, Dec (deg)"
              />
            </div>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">Upper Right</label>
              <br />
              <InputText
                id="in"
                value={ur}
                onChange={e => this.setState({ ur: e.target.value })}
                placeholder="RA, Dec (deg)"
              />
              <br />
              <br />
              <label htmlFor="in">Lower Right</label>
              <br />
              <InputText
                id="in"
                value={lr}
                onChange={e => this.setState({ lr: e.target.value })}
                placeholder="RA, Dec (deg)"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="Submit"
            style={{ width: '120px' }}
            onClick={this.handleSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
