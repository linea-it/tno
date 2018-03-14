import React, { Component } from 'react';
import {Row, Col, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';


class FilterObjectSearch extends Component {
    render() {
        return (
            <form inline>
                <FormGroup>
                  <InputGroup>
                    <FormControl type="text" placeholder="Search By Name" />
                    <InputGroup.Button>
                        <Button>Search</Button>
                    </InputGroup.Button>
                  </InputGroup>
                </FormGroup>
                <div className="clearfix"></div>
            </form>
        );
    }
}

export default FilterObjectSearch;
