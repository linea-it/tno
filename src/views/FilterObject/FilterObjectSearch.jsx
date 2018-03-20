import React, { Component } from 'react';
import {Row, Col, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';


class FilterObjectSearch extends Component {
    constructor(props) {
      super(props);
      this.state = {search: ''};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
      console.log(this.state)
      this.setState({search: event.target.value});
    }

    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.search);
      event.preventDefault();

      fetch("http://localhost:7003")
      // fetch("/filter_objects")
        .then(response => response.json())
        .then(json => {
          console.log(json);
          console.log('Carregou')
        });
    }

    render() {
        return (
            <form inline>
                <FormGroup>
                  <InputGroup>
                    <FormControl type="text" placeholder="Search By Name"
                        value={this.state.value} onChange={this.handleChange}/>
                    <InputGroup.Button>
                        <Button onClick={this.handleSubmit}>Search</Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
                <div className="clearfix"></div>
            </form>
        );
    }

}

export default FilterObjectSearch;
