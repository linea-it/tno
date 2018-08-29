import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import { Tooltip } from 'primereact/tooltip';
import PropTypes from 'prop-types';

class StepStats extends Component {
  render() {
    const propSet = this.props;
    console.log(propSet);
    const { string, array, any } = PropTypes;

    StepStats.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      columns: any.isRequired,
      info: array.isRequired,
      grid: array,
    };
    // Adaptação para Step com footer
    const footer = (
      <div>
        <span>Footer</span>
      </div>
    );

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
              {propSet.info[i].text}
            </li>
            <li className="number">{propSet.info[i].number}</li>
          </ul>
        </div>
      );
    });

    return (
      <div className="wrap">
        <Card
          footer={footer}
          subTitle={propSet.title}
          style={{ width: '535px' }}
        >
          <div className="ui-g">{areaIcon}</div>
          <ProgressBar>
            <Tooltip
              for="#inputId"
              title="Enter your username"
              tooltipPosition="bottom"
              tooltipEvent="hover"
            />
            <ProgressBar
              id="inputId"
              bsStyle=" progress-bar progress-bar-success "
              now={35}
              key={1}
            />
            <Tooltip
              for="#inputId2"
              title="Enter your username"
              tooltipPosition="bottom"
              tooltipEvent="hover"
            />
            <ProgressBar
              id="inputId2"
              bsStyle=" progress-bar progress-bar-danger "
              now={65}
              key={2}
            />
          </ProgressBar>
          <hr />
        </Card>
      </div>
    );
  }
}

export default StepStats;
