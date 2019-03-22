import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';

class Square extends React.Component {
  state = {
    ra_cent: '',
    dec_cent: '',
    radius: '',
  };
  onClick = () => {
    this.props.circle(
      this.state.ra_cent,
      this.state.dec_cent,
      this.state.radius
    );
  };
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        backdrop="static"
        aria-labelledby="contained-modal-title-vcenter"
        centered="true"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Fill in the fields of the coordinates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-grid">
            <div className="p-col-4">
              <br />
              <label htmlFor="in">RA CENT</label>
              <br />
              <InputText
                value={this.state.ra_cent}
                onChange={e => this.setState({ ra_cent: e.target.value })}
              />
            </div>
            <div className="p-col-4">
              <br />
              <label htmlFor="in">DEC CENT</label>
              <br />
              <InputText
                value={this.state.dec_cent}
                onChange={e => this.setState({ dec_cent: e.target.value })}
              />
            </div>
            <div className="p-col-3">
              <br />
              <label htmlFor="in">RADIUS</label>
              <br />
              <InputText
                value={this.state.radius}
                onChange={e => this.setState({ radius: e.target.value })}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="OK"
            style={{ width: '120px' }}
            onClick={this.onClick}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
