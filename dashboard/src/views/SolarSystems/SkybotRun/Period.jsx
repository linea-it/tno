import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';

class Square extends React.Component {
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
            <div className="p-col-6">
              {/* <br />
              <label htmlFor="in">RA UL</label>
              <br />
              <InputText
                id="in"
                value={this.state.ra_ul}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">RA UR</label>
              <br />
              <InputText
                id="in"
                value={this.state.ra_ur}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">RA LR</label>
              <br />
              <InputText
                id="in"
                value={this.state.ra_lr}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">RA LL</label>
              <br />
              <InputText
                id="in"
                value={this.state.ra_ll}
                onChange={e => this.setState({ value: e.target.value })}
              />
            </div>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">RA UL</label>
              <br />
              <InputText
                id="in"
                value={this.state.dec_ul}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">DEC UR</label>
              <br />
              <InputText
                value={this.state.dec_ur}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">DEC LR</label>
              <br />
              <InputText
                value={this.state.dec_lr}
                onChange={e => this.setState({ value: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">DEC LL</label>
              <br />
              <InputText
                value={this.state.dec_ll}
                onChange={e => this.setState({ value: e.target.value })}
              /> */}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            label="OK"
            style={{ width: '120px' }}
            onClick={this.props.onHide}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Square;
