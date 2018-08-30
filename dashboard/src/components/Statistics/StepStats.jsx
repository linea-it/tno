import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

class StepStats extends Component {
  render() {
    const propSet = this.props;
    const { string, array, any } = PropTypes;

    StepStats.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      columns: any.isRequired,
      info: array.isRequired,
      grid: array,
    };
    // Adaptação para Step com footer
    const footer = <span>{propSet.footer}</span>;

    const areaIcon = propSet.info.map((col, i) => {
      return (
        <div className={`ui-md-${propSet.info[i].grid}`}>
          <ul key={i} className="step-list">
            <li key={i}>
              <i
                className={`fa fa-fw fa-circle text-${
                  propSet.info[i].colorIcon
                }`}
              />
              {propSet.info[i].legend}
            </li>
            <li className="number">{propSet.info[i].label}</li>
          </ul>
        </div>
      );
    });

    const areaProgress = propSet.info.map((col, i) => {
      // const percent = `${Math.round(
      //   100 *
      //     propSet.info[i].value /

      // )}%`;
      return (
        <ProgressBar
          id="inputId"
          bsStyle={`progress-bar progress-bar-${propSet.info[i].colorIcon}`}
          now={50}
          key={i}
        />
      );
    });

    return (
      <div className="wrap">
        <Card
          className={`step-title ${propSet.disableCard}`}
          //footer={footer}
          subTitle={propSet.title}
          style={{ maxWidth: 'inherit' }}
        >
          <div className="ui-g">{areaIcon}</div>
          <ProgressBar>{areaProgress}</ProgressBar>
          <hr />
          {footer}
        </Card>
      </div>
    );
  }
}

export default StepStats;
