import React, { Component } from 'react';
import {FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';
import NumericInput from 'react-numeric-input';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

const options = [
    { label: 'Centaur', value:'Centaur' },
    { label: 'KBO>Detache', value:'KBO>Detache' },
    { label: 'KBO>Inner_C', value:'KBO>Inner_C' },
    { label: 'KBO>Main_Cl', value:'KBO>Main_Cl' },
    { label: 'KBO>Outer_C', value:'KBO>Outer_C' },
    { label: 'KBO>Resonan', value:'KBO>Resonan' },
    { label: 'KBO>SDO', value:'KBO>SDO' },
    { label: 'Mars-Crosse', value:'Mars-Crosse' },
    { label: 'MB>Cybele', value:'MB>Cybele' },
    { label: 'MB>Hilda', value:'MB>Hilda' },
    { label: 'MB>Hungaria', value:'MB>Hungaria' },
    { label: 'MB>IMB', value:'MB>IMB' },
    { label: 'MB>MMB', value:'MB>MMB' },
    { label: 'MB>OMB', value:'MB>OMB' },
    { label: 'MB>Outer', value:'MB>Outer' },
    { label: 'NEA>Amor', value:'NEA>Amor' },
    { label: 'NEA>Apollo', value:'NEA>Apollo' },
    { label: 'NEA>Aten', value:'NEA>Aten' },
    { label: 'Trojan', value:'Trojan' },
  ]


class FilterObjectForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            objectTable: "Centaur",
            useMagnitude: false,
            magnitude: 24,
            useDifferenceTime: false,
            diffDateNights: 0,
            moreFilter: false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleNumberChange = this.handleNumberChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeFilterMagnitude = this.handleChangeFilterMagnitude.bind(this)
        this.handleChangeDifferenceTime = this.handleChangeDifferenceTime.bind(this)
        this.handleSelectChange = this.handleSelectChange.bind(this)
    }


    handleSelectChange (value) {
        console.log(value);
        this.setState({"objectTable":value})
    }

    handleInputChange(event) {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;

      this.setState({
        [name]: value
      });
    }

    handleNumberChange(value, svalue, input) {
        this.setState({
            [input.name]: value
        })
    }

    handleSubmit(event) {
        event.preventDefault();
        // Apenas executa o metodo do component parent passando os dados do form
        this.props.onFilter(this.state)
    }


    handleChangeFilterMagnitude(event) {
        this.setState({"useMagnitude":event.target.checked});
    }

    handleChangeDifferenceTime(event) {
        this.setState({"useDifferenceTime":event.target.checked});
    }

    render() {
        return (
            <form>
                <FormGroup>
                  <ControlLabel>Object Table</ControlLabel>
                    <Select
    					closeOnSelect={false}
    					disabled={false}
    					multi
    					onChange={this.handleSelectChange}
    					options={options}
    					placeholder="Select your object table(s)"
                        removeSelected={true}
                        delimiter={";"}
    					simpleValue
                        value={this.state.objectTable}

                    />
                </FormGroup>
                <FormGroup>
                    <Checkbox inline onChange={this.handleChangeFilterMagnitude}>Magnitude</Checkbox>
                    <NumericInput className="form-control" name="magnitude" min={0} max={55} value={this.state.magnitude} disabled={!this.state.useMagnitude} onChange={this.handleNumberChange}/>
                </FormGroup>

                <FormGroup>
                    <Checkbox inline onChange={this.handleChangeDifferenceTime}>Minimum difference time between observations</Checkbox>
                    <NumericInput className="form-control" name="diffDateNights" min={0} max={1000} value={this.state.diffDateNights} disabled={!this.state.useDifferenceTime} onChange={this.handleNumberChange}/>
                </FormGroup>

                <FormGroup>
                      <Checkbox disabled={true} name= "moreFilter" inline checked={this.state.moreFilter} onChange={this.handleInputChange}>Show Only Objects with More than one filter in the some night?</Checkbox>
                </FormGroup>
                <Button bsStyle="info" pullRight fill type="submit"
                    onClick={this.handleSubmit}>Filter</Button>

                <div className="clearfix"></div>
            </form>
        );
    }
}

export default FilterObjectForm;
