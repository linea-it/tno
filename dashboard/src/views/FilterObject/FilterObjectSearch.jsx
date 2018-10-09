import React, { Component } from 'react';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import PropTypes from 'prop-types';

class FilterObjectSearch extends Component {
  constructor(props) {
    super(props);

    this.state = { search: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  handleChange(event) {
    this.setState({ search: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    // Apenas executa o metodo do component parent passando o termo que foi
    // usado na busca.
    if (this.state.search) {
      this.props.onSearch(this.state.search);
    }
  }

  render() {
    return (
      <form >
        <div className="flex-container">
        {/* <div className="ui-inputgroup"> */}
          <InputText
            value={this.state.search}
            placeholder="Search By Name"
            onChange={this.handleChange}
            style={{padding: '0px !important', height: '35px', width: '600px', margin: '0px !important' }}
          />
        {/* </div> */}

       <Button className="button-TNO" label="Search" onClick={this.handleSubmit} />

      </div>
        <div className="clearfix" />
      </form>
    );
  }
}

export default FilterObjectSearch;
