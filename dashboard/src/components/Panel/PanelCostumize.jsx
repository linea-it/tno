import React, { Component } from 'react';

class PanelCostumize extends Component {
  render() {
    const propSet = this.props;
    if (propSet.noHeader) {
      return (
        <div className={`panel-content ${propSet.className}`}>
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
}

export default PanelCostumize;
