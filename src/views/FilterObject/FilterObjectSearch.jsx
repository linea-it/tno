import React, { Component } from 'react';
import {Row, Col, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';


class FilterObjectSearch extends Component {
    constructor(props) {
      super(props);

      this.state = {search: "2002 TP36"};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
      this.setState({search: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        // Apenas executa o metodo do component parent passando o termo que foi
        // usado na busca.
        if (this.state.search) {
            this.props.onSearch(this.state.search)
        }
    }

    render() {
        return (
            <form>
                <FormGroup>
                  <InputGroup>
                    <FormControl type="text" placeholder="Search By Name"
                        value={this.state.search} onChange={this.handleChange}/>
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
