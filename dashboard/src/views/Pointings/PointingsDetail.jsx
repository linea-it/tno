import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import PointingApi from './PointingApi';
import PropertiesPointing from './PropertiesPointing';
import withRouter from 'react-router-dom/withRouter';

class PointingsDetail extends Component {
  state = this.initialState;
  api = new PointingApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    record: PropTypes.object,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: null,
      record: {},
    };
  }

  componentDidMount() {
    //console.log('componentDidMount');
    const {
      match: { params },
    } = this.props;
    // console.log('ID: ', params.id);

    this.api.getPointingRecord({ id: params.id }).then(res => {
      const record = res.data;
      //console.log(record);

      this.setState({ record: record });
    });
  }

  render() {
    const { record } = this.state;

    return (
      <div className="content">
        <Grid>
          <Row>
            <PropertiesPointing record={record}/>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(PointingsDetail);
