import React, { Component } from 'react';
import { Calendar } from 'primereact/calendar';
import { Spinner } from 'primereact/spinner';
import PropTypes from 'prop-types';
//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Components
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

// APIs
import OrbitApi from '../RefineOrbit/OrbitApi';
import PredictionApi from './PredictionApi';
import { FormValidation } from '../../components/FormValidation/FormValidation';

export class PredictionSubmit extends Component {
  state = this.initialState;
  apiOrbit = new OrbitApi();
  apiPrediction = new PredictionApi();

  static propTypes = {
    onCreateRun: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      dataOrbit: [],
      object: [],
      processes: [],
      process: null,
      catalogs: [],
      catalog: null,
      leap_seconds: [],
      leap_second: null,
      bsps_planeraty: [],
      bsp_planeraty: null,
      catalog_radius: 0.15,
      message: '',
      actionButton: false,
      ephemeris_initial_date: '',
      ephemeris_final_date: '',
      ephemeris_step: 600,
      validation_text: '',
      validation_type: '',
      validation_display: 'none',
    };
  }
  componentDidMount() {
    // Processos ( Rodadas da etapa anterior Refinamento de Orbita que tiveram sucesso )
    this.apiOrbit
      .getOrbitRuns({
        ordering: '-start_time',
        filters: [
          {
            property: 'status',
            value: 'success',
          },
        ],
      })
      .then(res => {
        const r = res.data;
        this.setState({
          processes: r.results,
        });
      });

    this.apiPrediction.getCatalogs().then(res => {
      const catalogs = res.data.results;
      let catalog = null;

      if (catalogs.length > 0) {
        catalog = {
          label: catalogs[0].display_name,
          value: catalogs[0].id,
        };
      }

      this.setState({
        catalogs: catalogs,
        catalog: catalog,
      });
    });

    this.apiPrediction.getLeapSeconds().then(res => {
      const leap_seconds = res.data.results;
      let leap_second = null;

      if (leap_seconds.length > 0) {
        leap_second = {
          label: leap_seconds[0].display_name,
          value: leap_seconds[0].id,
        };
      }
      this.setState({
        leap_seconds: leap_seconds,
        leap_second: leap_second,
      });
    });

    this.apiPrediction.getBspPlanetary().then(res => {
      const bsps_planetary = res.data.results;
      let bsp_planeraty = null;

      if (bsps_planetary.length > 0) {
        bsp_planeraty = {
          label: bsps_planetary[0].display_name,
          value: bsps_planetary[0].id,
        };
      }

      this.setState({
        bsps_planeraty: bsps_planetary,
        bsp_planeraty: bsp_planeraty,
      });
    });

    // Ephemeris Initial and Final Date
    const year = new Date();
    this.setState({
      ephemeris_initial_date: new Date(year.getFullYear(), 0, 1),
      ephemeris_final_date: new Date(year.getFullYear(), 11, 31, 23, 59, 59),
    });
  }

  onCheck = value => {
    if (this.state.process !== null) {
      this.setState({ actionButton: true });

      if (value === 0) {
        this.setState({
          validation_display: 'block',
          validation_text: 'Os Campos não foram preenchidos',
          validation_type: 'danger',
        });
      }
    }
  };

  onClear = () => {
    this.setState({
      validation_display: 'none',
      validation_text: '',
      validation_type: '',
    });
  };

  onClick = () => {
    if (
      this.state.ephemeris_initial_date === '' ||
      this.state.ephemeris_final_date === ''
    ) {
      const value = 0;
      this.onCheck(value);
    } else {
      this.onClear;
      const {
        process,
        leap_second,
        bsp_planeraty,
        catalog,
        catalog_radius,
        ephemeris_initial_date,
        ephemeris_final_date,
        ephemeris_step,
      } = this.state;

      this.apiPrediction
        .createPredictRun({
          process: process.process,
          input_list: process.input_list,
          input_orbit: process.value,
          catalog: catalog.value,
          catalog_radius: catalog_radius,
          leap_second: leap_second.value,
          bsp_planetary: bsp_planeraty.value,
          ephemeris_initial_date: ephemeris_initial_date,
          ephemeris_final_date: ephemeris_final_date,
          ephemeris_step: ephemeris_step,
        })
        .then(res => {
          this.onCreateSuccess(res.data);
        })
        .catch(this.onCreateFailure('sim'));
    }
  };

  onCreateSuccess = record => {
    // console.log('onCreateSuccess(%o)', record);
    this.setState(this.initialState, this.props.onCreateRun(record));

    // validation_text: 'Submissão realizada com sucesso',
    //       validation_type: 'success',
  };
  onCreateFailure = error => {
    // TODO: Criar uma Notificacao de falha.
    console.log('onCreateFailure(%o)', error);
  };

  onChangeProcess = e => {
    this.setState({ process: e.value }, this.onCheck);
  };

  onChangeCatalog = e => {
    this.setState({ catalog: e.value });
  };

  onChangeLeap = e => {
    this.setState({ leap_second: e.value });
  };

  onChangeBsp = e => {
    this.setState({ bsp_planeraty: e.value });
  };

  OrbitName = () => {
    this.api.getRefineOrbits().then(res => {
      const r = res.data;
      this.setState({
        dataOrbit: r.results,
      });
    });
  };

  processDropdown = () => {
    // Combobox Processos ( E as rodadas do Refine Orbit que tiveram sucesso )
    const processes = this.state.processes;
    const process_elements = [];
    processes.map(el => {
      process_elements.push({
        label: el.proccess_displayname,
        value: el.id, // Id da execucao de refinamento de orbita
        input_list: el.input_list, // Id da lista de objetos
        process: el.proccess, // Id do processo
      });
      return;
    });

    return (
      <Dropdown
        autoWidth={false}
        key={1}
        value={this.state.process}
        options={process_elements}
        onChange={this.onChangeProcess}
        placeholder="Select a Input"
        optionLabel="label"
      />
    );
  };

  catalogDropdown = () => {
    // Combobox Catalogs
    const catalogs = this.state.catalogs;
    const catalog_elements = [];

    catalogs.map(el => {
      catalog_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <Dropdown
        autoWidth={false}
        key={2}
        value={this.state.catalog}
        options={catalog_elements}
        onChange={this.onChangeCatalog}
        placeholder="Select a Catalog"
        optionLabel="label"
      />
    );
  };

  leapSecondDropdown = () => {
    // Combobox LeapSecond
    const leaps = this.state.leap_seconds;
    const leaps_elements = [];

    leaps.map(el => {
      leaps_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <div>
        <Dropdown
          autoWidth={false}
          key={3}
          value={this.state.leap_second}
          options={leaps_elements}
          onChange={this.onChangeLeap}
          placeholder="Select a Leap Second"
          optionLabel="label"
        />
      </div>
    );
  };

  bspPlanetaryDropdown = () => {
    // Combobox BSP Planetary
    const bsps = this.state.bsps_planeraty;
    const bsp_elements = [];

    bsps.map(el => {
      bsp_elements.push({
        label: el.display_name,
        value: el.id,
      });
      return;
    });

    return (
      <div>
        <Dropdown
          autoWidth={false}
          key={4}
          value={this.state.bsp_planeraty}
          options={bsp_elements}
          onChange={this.onChangeBsp}
          placeholder="Select a BSP Planetary"
          optionLabel="label"
        />
      </div>
    );
  };

  radiusInput = () => {
    return (
      <Spinner
        size={50}
        value={this.state.catalog_radius}
        onChange={e => this.setState({ catalog_radius: e.value })}
        min={0}
        max={2}
        step={0.01}
      />
    );
  };

  ephemerisDateInitial = () => {
    return (
      <Calendar
        // required
        disabled={!this.state.actionButton}
        showIcon={true}
        value={this.state.ephemeris_initial_date}
        onChange={e =>
          this.setState({ ephemeris_initial_date: e.value }, this.onCheck())
        }
        placeholder="Initial Date"
        dateFormat="yy-dd-mm"
        showTime={true}
        showSeconds={true}
      />
    );
  };

  ephemerisDateFinal = () => {
    return (
      <Calendar
        // required
        disabled={!this.state.actionButton}
        showIcon={true}
        value={this.state.ephemeris_final_date}
        onChange={e =>
          this.setState({ ephemeris_final_date: e.value }, this.onCheck())
        }
        placeholder="Final Date"
        dateFormat="yy-mm-dd"
        showTime={true}
        showSeconds={true}
      />
    );
  };

  ephemerisStep = () => {
    return (
      <Spinner
        value={this.state.ephemeris_step}
        onChange={e => this.setState({ ephemeris_step: e.value })}
        min={60}
        max={1800}
        step={10}
      />
    );
  };

  render() {
    console.log(this.state.ephemeris_initial_date);
    console.log(this.state.ephemeris_final_date);
    return (
      <div>
        <div className="ui-g ui-fluid">
          <div className="ui-md-6">
            <p className="label-prediction">Input</p>
            {this.processDropdown()}
          </div>
          <div className="ui-md-6">
            <p className="label-prediction">Catalog Radius</p>
            {this.radiusInput()}
          </div>
          <div className="ui-md-6">
            <p className="label-prediction">Catalog</p>
            {this.catalogDropdown()}
          </div>

          <div className="ui-md-6">
            <p className="label-prediction"> Ephemeris Step</p>
            {this.ephemerisStep()}
          </div>
        </div>
        <div className="ui-g ui-fluid">
          <div className="ui-md-6">
            <p className="label-prediction"> Leap Seconds</p>

            {this.leapSecondDropdown()}
          </div>
          <div className="ui-md-6">
            <p className="label-prediction">Ephemeris Initial Initial</p>
            {this.ephemerisDateInitial()}
          </div>
          <div className="ui-md-6">
            <p className="label-prediction"> BSP Planetary</p>

            {this.bspPlanetaryDropdown()}
          </div>

          <div className="ui-md-6">
            <p className="label-prediction"> Ephemeris Initial Date </p>

            {this.ephemerisDateFinal()}
          </div>
        </div>
        <br />
        <FormValidation
          text={this.state.validation_text}
          type={this.state.validation_type}
          display={this.state.validation_display}
        />
        <Button
          label="Submit"
          disabled={!this.state.actionButton}
          onClick={this.onClick}
          className=" button-TNO button-prediction"
        />
        <NotificationContainer />
      </div>
    );
  }
}

export default PredictionSubmit;
