import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import OrbitApi from './OrbitApi';
import PropTypes from 'prop-types';

class Log extends Component {
  api = new OrbitApi();

  state = { textLog: [] };

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    id: PropTypes.any.isRequired,
  };

  componentDidMount() {
    this.api.getLogRefineOrbits().then(res => {
      const r = res.data;
      this.setState({ textLog: r.lines });
    });
  }

  render() {
    const { visible, onHide, id } = this.props;
    const teste = [];
    const alines = this.state.textLog;
    alines.forEach(line => {
      teste.push(<div>{line}</div>);
    });
    return (
      <Dialog
        header={id.input_displayname}
        visible={visible}
        width="650px"
        modal={true}
        //e => this.setState({ visible: false })
        onHide={onHide}
        style={{
          color: '#ffffff',
          backgroundColor: '#254356',
          width: 900 + 'px',
        }}
      >
        <pre
          style={{
            color: '#ffffff',
            backgroundColor: '#254356',
            height: 800 + 'px',
            border: 'none',
          }}
        >
          Object: {id.input_displayname} id: {id.input_displayname}
          {teste}
        </pre>
      </Dialog>
    );
  }
}

export default Log;
