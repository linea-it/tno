import React from 'react';
import PropTypes from 'prop-types';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Sidebar } from 'primereact/sidebar';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';

class FilterPointings extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState = () => {
    const initialState = {
      dynclass: '',
      mv: '',
      open: true,
      validation: null,
      controlId: null,
      errorMessage: null,
      colorAlert: null,
    };
    return initialState;
  };

  static propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.setState({ open: false });
  }
  
  ErroEmpty = () => {
    this.setState({ validation: 'error' });
    this.setState({ controlId: 'formValidationerror4' });
    this.setState({
      errorMessage: 'Empty fields, please fill in some search field ',
    });
    this.setState({ colorAlert: 'danger' });
    this.setState({ open: true });
    console.log('Não tá chegando');
  };

  ErroReset = () => {
    this.setState({ validation: null });
    this.setState({ controlId: null });
    this.setState({
      errorMessage: null,
    });
    this.setState({ colorAlert: null });
    this.setState({ open: false });
  };

  onClear = () => {
    this.setState(this.getInitialState());
    this.setState({ open: false });
  };

  handlerSubmitFilter = () => {
    console.log(this.state.dynclass);
    if (this.state.mv === '' && this.state.dynclass === '') {
      this.ErroEmpty();
    } else {
      this.setState({ validation: null });
      this.setState({ open: false });
      // passa para o parent por props
      const filter = [];

      if (this.state.dynclass) {
        filter.push({
          property: 'dynclass__in',
          value: this.state.dynclass.toString(),
        });
      }

      if (this.state.mv) {
        filter.push({
          property: 'mv__range',
          value: this.state.mv.value,
        });
      }
      this.props.onFilter(filter);
    }
    this.setState({ state: this.getInitialState });
  };

  onClose = () => {
    this.props.onHide();
    this.setState({ open: false });
    this.ErroReset();
  };

  render() {
    const { show, onHide } = this.props;

    const dynclassValues = [
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

    const magnitude = [
      { value: '18,19', label: '18 - 19' },
      { value: '19,20', label: '19 - 20' },
      { value: '20,21', label: '20 - 21' },
      { value: '21,22', label: '21 - 22' },
      { value: '22,23', label: '22 - 23' },
      { value: '23,24', label: '23 - 24' },
      { value: '24,25', label: '24 - 25' },
      { value: '25,26', label: '25 - 26' },
      { value: '26,27', label: '26 - 27' },
      { value: '27,28', label: '27 - 28' },
      { value: '28,29', label: '28 - 29' },
      { value: '29,30', label: '29 - 30' },
      { value: '30,31', label: '30 - 31' },
      { value: '31,32', label: '31 - 32' },
      { value: '32,33', label: '32 - 33' },
      { value: '33,34', label: '33 - 34' },
      { value: '34,35', label: '34 - 35' },
      { value: '35,36', label: '35 - 36' },
    ];

    return (
      <Sidebar
        style={{ widht: 'none !important' }}
        visible={show}
        position="right"
        onHide={onHide}
      >
        <br />
        <div className="ui-g ui-fluid">
          <div className="ui-g-12">
            <form>
              <div className="ui-g">
                <div className="ui-g-12">
                  <p> Visual Magnitude </p>
                  <Dropdown
                    value={this.state.mv}
                    options={magnitude}
                    onChange={e => {
                      this.setState({ mv: e.value });
                    }}
                    placeholder="Select a visual magnitude"
                    style={{ width: '200px' }}
                  />
                </div>
              </div>
              <div className="ui-g">
                <div className="ui-g-12">
                  <p> Dynamics Class </p>
                  <MultiSelect
                    value={this.state.dynclass}
                    options={dynclassValues}
                    onChange={e => {
                      this.setState({ dynclass: e.value });
                    }}
                    //filter={true}
                    placeholder="Select a dynamics class"
                    style={{ width: '200px' }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="ui-g">
          <div className="ui-g-12">
            <Button label="Filter" onClick={this.handlerSubmitFilter} />
            <Button label="Clear" onClick={this.onClear} />
            <Button label="Close" onClick={this.onClose} />
          </div>
        </div>
      </Sidebar>
    );
  }
}

export default FilterPointings;
