import React, { Component } from 'react';
import Content from 'components/CardContent/CardContent.jsx';
import PropTypes from 'prop-types';
class RefineOrbitRunning extends Component {
  state = this.initialState;

  get initialState() {
    return {};
  }

  static propTypes = {
    record: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    const { record } = this.props;
    let id = '';

    if ('id' in record) {
      id = record.id;
    }
    return (
      <Content
        content={
          <div className="content">
            NIMA RUN ID: {id}
            <br />Stream LOGs{' '}
          </div>
        }
      />
    );
  }
}

export default RefineOrbitRunning;
