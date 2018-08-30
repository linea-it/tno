import React, { Component } from 'react';

class PanelCostumize extends Component {
  render() {
    const propSet = this.props;
    return (
      <div className="panel-content">
        <div className={`header ${propSet.colorHead}`}>
          <p className="title">{propSet.title}</p>
        </div>
        {propSet.content}
      </div>
    );
  }
}

export default PanelCostumize;
