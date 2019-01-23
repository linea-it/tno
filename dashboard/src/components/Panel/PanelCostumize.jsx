import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PanelCostumize extends Component {
  render() {
    const propSet = this.props;
    if (propSet.noHeader) {
      return (
        <div className={`panel-content-noheader ${propSet.className}`}>
          <p className="subTitle">{propSet.subTitle}</p>
          {propSet.content}
        </div>
      );
    } else {
      return (
        <div className={`panel-content ${propSet.className}`}>
          <div className={`header ${propSet.colorHead}`}>
            <p className="title">{propSet.title}</p>
          </div>
          <p className="subTitle">{propSet.subTitle}</p>
          {propSet.content}
        </div>
      );
    }
  }
  //  Validation PropType
  PropTypes = {
    noHeader: PropTypes.bool,
    className: PropTypes.string,
    subTitle: PropTypes.string,
    content: PropTypes.any,
    title: PropTypes.string,
    colorHead: PropTypes.string,
  };
}

export default PanelCostumize;
