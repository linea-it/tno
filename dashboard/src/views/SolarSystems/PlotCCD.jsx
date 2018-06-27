import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
// import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class SkybotDetail extends Component {
  static propTypes = {
    record: PropTypes.object,
  };

  render() {
    return (
      <div className="content">
        <Card
          title="Plot of CDD"
          category=""
          content={
            <div>
                <p>Teste</p>
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(SkybotDetail);
