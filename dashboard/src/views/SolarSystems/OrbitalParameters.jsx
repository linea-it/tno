import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Table } from 'react-bootstrap';
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
    const parameters = [
      'epoch',
      'epoch JD',
      'perihelion date',
      'perihelion JD',
      'argument of perihelion (°)',
      'ascending node (°)',
      'inclination (°)',
      'eccentricity',
      'perihelion distance (AU)',
      'Tisserand w.r.t. Jupiter',
      'ΔV w.r.t. Earth (km/sec)',
    ];
    var rows = [];
    for (var i = 0; i < parameters.length; i++) {
      rows.push(
        <tr key={i}>
          <td>{parameters[i]}</td>
          <td>{parameters[i].length}</td>
        </tr>
      );
    }

    return (
      <div className="content">
        <Card
          title="Orbital Parameters"
          category="EXEMPLO DO CONTEÚDO DE UM ARQUIVO ORBITAL PARAMETERS"
          content={
            <div>
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>atributte</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(SkybotDetail);
