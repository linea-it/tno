import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Modal } from 'react-bootstrap';
import { Button } from 'primereact/button';

class Square extends React.Component {
  state = {
    ur: '',
    ul: '',
    lr: '',
    ll: '',
  };

  onClick = () => {
    this.props.radec(
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
            <p>
              Utilize (,) como separador das coordenadas RA e DEC. Exemplo:
              RADEC UR: 000,000
            </p>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">RADEC UR</label>
              <br />
              <InputText
                id="in"
                value={ur}
                onChange={e => this.setState({ ur: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">RADEC UL</label>
              <br />
              <InputText
                id="in"
                value={ul}
                onChange={e => this.setState({ ul: e.target.value })}
              />
            </div>
            <div className="p-col-6">
              <br />
              <label htmlFor="in">RADEC LR</label>
              <br />
              <InputText
                id="in"
                value={lr}
                onChange={e => this.setState({ lr: e.target.value })}
              />
              <br />
              <br />
              <label htmlFor="in">RADEC LL</label>
              <br />
              <InputText
                id="in"
                value={ll}
                onChange={e => this.setState({ ll: e.target.value })}
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
