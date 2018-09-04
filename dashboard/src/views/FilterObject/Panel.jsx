import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import FilterObject from './FilterObject';
import CustomList from 'views/ObjectList/CustomList';

class FilterPanel extends Component {
  state = this.initialState;

  get initialState() {
    return {};
  }

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  render() {
    return (
      <div className="content">
        <FilterObject />
        <CustomList />
      </div>
    );
  }
}

export default withRouter(FilterPanel);
