import React, { Component } from 'react';
import {Row, Col, FormGroup, ControlLabel, FormControl, Checkbox } from 'react-bootstrap';
import {FormInputs} from 'components/FormInputs/FormInputs.jsx';
import Button from 'elements/CustomButton/CustomButton.jsx';
import Card from 'components/Card/Card.jsx';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';


class FilterObjectForm extends Component {
    render() {
        return (
            <form>
                <FormGroup controlId="formControlsSelect">
                  <ControlLabel>Object Table</ControlLabel>
                  <FormControl componentClass="select" placeholder="select">
                    <option value="centaur">Centaur</option>
                    <option value="kbo_detache">KBO Detache</option>
                  </FormControl>
                </FormGroup>

                <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Magnitude</ControlLabel>
                    <Slider min={0} max={55} defaultValue={20} />
                </FormGroup>

                <FormGroup controlId="formControlsSelect">
                    <ControlLabel>Minumun difference between times</ControlLabel>
                    <Slider min={0} max={1000} defaultValue={0} />
                </FormGroup>
                <FormGroup>
                      <Checkbox inline>Show Only Objects with More than one filter in the some night?</Checkbox>
                </FormGroup>
                <Button
                    bsStyle="info"
                    pullRight
                    fill
                    type="submit"
                >
                    Filter
                </Button>
                <div className="clearfix"></div>
            </form>
        );
    }
}

export default FilterObjectForm;
