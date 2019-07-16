import React, { Component } from 'react';
import { Table, Badge } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import Content from 'components/CardContent/CardContent.jsx';
import PropTypes from 'prop-types';
import Card from 'primereact/card';

class ListStats extends Component {
  render() {
    const propSet = this.props;

    const { array, bool } = PropTypes;

    // ListStats.PropTypes = {
    //   //title: string.isRequired,
    //   data: array.isRequired,
    //   status: bool.isRequired,
    // };

    // console.log(propSet.data[0]);


    const columns = propSet.data.map((col, i) => {

      if (propSet.badgeColumns) {

        return (
          <tr key={i}>
            <td className="font-format">{propSet.data[i].name}</td>

            <td>
              <Badge className={`label-list label-${propSet.statstext}`}>
                {propSet.data[i].value}
              </Badge>
            </td>
          </tr>
        );
      } else {

        return (
          <tr key={i}>
            <td className="list-text">
              <div>{propSet.data[i].name}:</div>
            </td>
            <td className="list-value">
              <div>{propSet.data[i].value}</div>
            </td>
          </tr >
        );
      }
    });

    const status = [];

    //No código em AsteroidRunDetail, o status está sempre em true
    // if (propSet.status) {
    //   status.push(
    //     <tr key={status}>
    //       <td className="list-text">
    //         <strong>Status</strong>
    //       </td>
    //       <td className="list-value">


    //         {/* <Badge className={`label label-outline label-${propSet.statstext}`}>
    //           {propSet.statstext}
    //         </Badge> */}

    //         <Badge className={`label label-outline label-${propSet.statstext}`}>
    //           {propSet.statstext}
    //         </Badge>

    //       </td>
    //     </tr>
    //   );
    // }





    if (propSet.statstext == "success") {
      status.push(
        <tr key={status}>
          <td className="list-text">
            <strong>Status</strong>
          </td>
          <td className="list-value">
            <Badge className={`label label-outline label-${propSet.statstext}`}>
              {propSet.statstext}
            </Badge>


          </td>
        </tr>
      );
    } else {
      status.push(
        <tr key={status}>
          <td className="list-text">
            <strong>Status</strong>
          </td>
          <td className="list-value">
            <Badge variant="info">
              {propSet.statstext}
            </Badge>
          </td>
        </tr>
      );
    }


    return (
      <div>
        <Content
          content={
            // < style={{background}}>
            <Table>
              <tbody>
                {status}
                {columns}
              </tbody>
            </Table>
          }
        />
      </div>
    );
  }
}

export default ListStats;
