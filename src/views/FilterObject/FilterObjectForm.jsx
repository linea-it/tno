import React, { Component } from 'react';
import {Row, Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';
import Card from 'components/Card/Card.jsx'

class FilterObjectForm extends Component {
    render() {
        return (
            <form>
                <FormGroup controlId="formControlsSelect">
                  <ControlLabel>Select</ControlLabel>
                  <FormControl componentClass="select" placeholder="select">
                    <option value="centaur">Centaur</option>
                    <option value="kbo_detache">KBO Detache</option>
                  </FormControl>
                </FormGroup>
            </form>
        );
    }
}

export default FilterObjectForm;
