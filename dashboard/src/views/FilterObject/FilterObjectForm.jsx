import React, { Component } from 'react';
import { FormGroup, ControlLabel, Checkbox } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';
import NumericInput from 'react-numeric-input';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

const options = [
  { label: 'Centaur', value: 'Centaur' },
  { label: 'Hungaria', value: 'Hungaria' },
  { label: 'KBO>Classical>Inner', value: 'KBO>Classical>Inner' },
  { label: 'KBO>Classical>Main', value: 'KBO>Classical>Main' },
  { label: 'KBO>Detached', value: 'KBO>Detached' },
  { label: 'KBO>Resonant>11:3', value: 'KBO>Resonant>11:3' },
  { label: 'KBO>Resonant>11:6', value: 'KBO>Resonant>11:6' },
  { label: 'KBO>Resonant>11:8', value: 'KBO>Resonant>11:8' },
  { label: 'KBO>Resonant>19:9', value: 'KBO>Resonant>19:9' },
  { label: 'KBO>Resonant>2:1', value: 'KBO>Resonant>2:1' },
  { label: 'KBO>Resonant>3:1', value: 'KBO>Resonant>3:1' },
  { label: 'KBO>Resonant>3:2', value: 'KBO>Resonant>3:2' },
  { label: 'KBO>Resonant>4:3', value: 'KBO>Resonant>4:3' },
  { label: 'KBO>Resonant>5:2', value: 'KBO>Resonant>5:2' },
  { label: 'KBO>Resonant>5:3', value: 'KBO>Resonant>5:3' },
  { label: 'KBO>Resonant>5:4', value: 'KBO>Resonant>5:4' },
  { label: 'KBO>Resonant>7:2', value: 'KBO>Resonant>7:2' },
  { label: 'KBO>Resonant>7:3', value: 'KBO>Resonant>7:3' },
  { label: 'KBO>Resonant>7:4', value: 'KBO>Resonant>7:4' },
  { label: 'KBO>Resonant>9:4', value: 'KBO>Resonant>9:4' },
  { label: 'KBO>Resonant>9:5', value: 'KBO>Resonant>9:5' },
  { label: 'KBO>SDO', value: 'KBO>SDO' },
  { label: 'Mars-Crosser', value: 'Mars-Crosser' },
  { label: 'MB>Cybele', value: 'MB>Cybele' },
  { label: 'MB>Hilda', value: 'MB>Hilda' },
  { label: 'MB>Inner', value: 'MB>Inner' },
  { label: 'MB>Middle', value: 'MB>Middle' },
  { label: 'MB>Outer', value: 'MB>Outer' },
  { label: 'NEA>Amor', value: 'NEA>Amor' },
  { label: 'NEA>Apollo', value: 'NEA>Apollo' },
  { label: 'NEA>Aten', value: 'NEA>Aten' },
  { label: 'Trojan', value: 'Trojan' },
];

class FilterObjectForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      objectTable: 'Centaur',
      useMagnitude: false,
      magnitude: 24,
      useDifferenceTime: false,
      diffDateNights: 0,
      moreFilter: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleNumberChange = this.handleNumberChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeFilterMagnitude = this.handleChangeFilterMagnitude.bind(
      this
    );
    this.handleChangeDifferenceTime = this.handleChangeDifferenceTime.bind(
      this
    );
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(value) {
    console.log(value);
    this.setState({ objectTable: value });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  }

  handleNumberChange(value, svalue, input) {
    this.setState({
      [input.name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    // Apenas executa o metodo do component parent passando os dados do form
    this.props.onFilter(this.state);
  }

  handleChangeFilterMagnitude(event) {
    this.setState({ useMagnitude: event.target.checked });
  }

  handleChangeDifferenceTime(event) {
    this.setState({ useDifferenceTime: event.target.checked });
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
            delimiter={';'}
            simpleValue
            value={this.state.objectTable}
          />
        </FormGroup>
        <FormGroup>
          <Checkbox inline onChange={this.handleChangeFilterMagnitude}>
               Magnitude "Visual Magnitude &#60;=" 
          </Checkbox>
          <NumericInput
            className="form-control"
            name="magnitude"
            min={0}
            max={55}
            value={this.state.magnitude}
            disabled={!this.state.useMagnitude}
            onChange={this.handleNumberChange}
          />
        </FormGroup>

        <FormGroup>
          <Checkbox inline onChange={this.handleChangeDifferenceTime}>
            Minimum difference time between observations
          </Checkbox>
          <NumericInput
            className="form-control"
            name="diffDateNights"
            min={0}
            max={1000}
            value={this.state.diffDateNights}
            disabled={!this.state.useDifferenceTime}
            onChange={this.handleNumberChange}
          />
        </FormGroup>

        <FormGroup>
          <Checkbox
            disabled={true}
            name="moreFilter"
            inline
            checked={this.state.moreFilter}
            onChange={this.handleInputChange}
          >
            Show same Objects with More than one filter in the some night?
          </Checkbox>
        </FormGroup>
        <Button
          bsStyle="info"
          pullRight
          fill
          type="submit"
          onClick={this.handleSubmit}
        >
          Filter
        </Button>

        <div className="clearfix" />
      </form>
    );
  }
}

export default FilterObjectForm;
