import React, { Component } from 'react';
import { Button } from 'primereact/button';
import SkybotApi from './SkybotApi';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';

class SkybotRun extends Component {
  apiSkybotRun = new SkybotApi();

  state = this.initialState;

  get initialState() {
    return {
      //   start: null,
      //   final: null,
      status: 'pending',
      exposure: 232,
      radioMark: 'exposure',
      displayDate: 'none',
      displayRegion: 'none',
      region: '',
      dateInitial: '',
      dateFinal: '',
      typeRun: 'all',
      ra_cent: '',
      dec_cent: '',
    };
  }

  componentDidMount = () => {
    this.setType();
  };
  onClickSubmit = () => {
    const {
      start: start,
      final: final,
      status: status,
      exposure: exposure,
      dateInitial: dateInitial,
      dateFinal: dateFinal,
      radioMark: radioMark,
      ra_cent: ra_cent,
      dec_cent: dec_cent,
    } = this.state;

    this.apiSkybotRun
      .createSkybotRun({
        start: start,
        final: final,
        status: status,
        exposure: exposure,
        dateInitial: dateInitial,
        dateFinal: dateFinal,
        typeRun: radioMark,
        ra_cent: ra_cent,
        dec_cent: dec_cent,
      })
      .then(res => {
        this.onCreateSuccess(res.data);
      })
      .catch(error => {
        this.onCreateFailure(error);
      });
  };

  setType = () => {
    const checkedUpper = this.state.radioMark;
    const checkedLower = this.state.region;

    if (checkedUpper) {
      this.setState({ typeRun: checkedUpper });
    } else {
      this.setState({ typeRun: checkedLower });
    }
  };

  // onVisible = checked => {
  //   if (checked === 'circle' || 'square') {
  //     this.setState({ region: checked });
  //   } else {
  //     this.setState({ radioMark: checked });
  //   }

  //   if (checked == 'period') {
  //     this.setState({ displayDate: 'block' });
  //   } else {
  //     this.setState({ displayDate: 'none' });
  //   }

  //   if (checked == 'region') {
  //     this.setState({ displayRegion: 'block' });
  //   } else {
  //     this.setState({ displayRegion: 'none' });
  //   }
  // };

  render() {
    const state = this.state;
    console.log('ra %s e dec %s', state.ra_cent, state.dec_cent);
    console.log('type', state.radioMark);
    return (
      <div className="p-col-6">
        <PanelCostumize
          title="Skybot Run"
          className="margin-panel"
          content={
            <Content
              title="SubTitle"
              content={
                <div>
                  <div
                    className="p-grid"
                    style={{ width: '', marginBottom: '10px' }}
                  >
                    <div className="p-col-12">
                      <RadioButton
                        inputId="rb1"
                        name="skybotRun"
                        value="exposure"
                        // onChange={e => this.onVisible(e.value)}
                        onChange={e => this.setState({ radioMark: e.value })}
                        checked={this.state.radioMark === 'exposure'}
                      />
                      <label
                        htmlFor="rb1"
                        className="p-radiobutton-label font-size-medium"
                      >
                        Select run for all exposure
                      </label>
                      <br />
                      <RadioButton
                        inputId="rb2"
                        name="skybotRun"
                        value="period"
                        // onChange={e => this.onVisible(e.value)}
                        onChange={e => this.setState({ radioMark: e.value })}
                        checked={this.state.radioMark === 'period'}
                      />
                      <label
                        htmlFor="rb2"
                        className="p-radiobutton-label font-size-medium"
                      >
                        Select run per Period
                      </label>

                      <div className="p-grid p-dir-row">
                        {/* {this.state.radioMark === 'period' ? ( */}
                        <div>
                          <div className="p-col-6">
                            <Calendar
                              // style={{ display: `${this.state.displayDate}` }}
                              disabled={
                                this.state.radioMark === 'period' ? false : true
                              }
                              placeholder="Date initial"
                              value={state.dateInitial}
                              onChange={e =>
                                this.setState({ dateInitial: e.value })
                              }
                            />
                          </div>
                          <div className="p-col-6">
                            <Calendar
                              disabled={
                                this.state.radioMark === 'period' ? false : true
                              }
                              placeholder="Date Final"
                              value={state.dateFinal}
                              onChange={e =>
                                this.setState({ dateFinal: e.value })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <RadioButton
                        inputId="rb3"
                        name="skybotRun"
                        value="region"
                        onChange={e => this.setState({ radioMark: e.value })}
                        // onChange={e => this.onVisible(e.value)}
                        checked={this.state.radioMark === 'region'}
                      />
                      <label
                        htmlFor="rb3"
                        className="p-radiobutton-label font-size-medium"
                      >
                        Select run per Region
                      </label>

                      <div className="p-grid p-dir-row">
                        <div className="p-col-6">
                          <RadioButton
                            disabled={
                              this.state.radioMark === 'region' ? false : true
                            }
                            inputId="rb4"
                            name="region"
                            value="circle"
                            onChange={e => this.setState({ region: e.value })}
                            checked={this.state.region === 'circle'}
                          />
                          <label
                            htmlFor="rb4"
                            className="p-radiobutton-label font-size-medium"
                          >
                            circle
                          </label>
                        </div>

                        <div className="p-col-6">
                          <RadioButton
                            disabled={
                              this.state.radioMark === 'region' ? false : true
                            }
                            inputId="rb5"
                            name="region"
                            value="square"
                            onChange={e => this.setState({ region: e.value })}
                            checked={this.state.region === 'square'}
                          />
                          <label
                            htmlFor="rb5"
                            className="p-radiobutton-label font-size-medium"
                          >
                            square
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="p-col-12">
                      <InputText
                        placeholder="RA cent"
                        value={this.state.ra_cent}
                        onChange={e =>
                          this.setState({ ra_cent: e.target.value })
                        }
                      />
                      <br />
                      <InputText
                        placeholder="DEC cent"
                        value={this.state.dec_cent}
                        onChange={e =>
                          this.setState({ dec_cent: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      style={{
                        marginLeft: '75%',
                        width: '100px',
                        height: '30px',
                      }}
                      label="Run"
                      onClick={this.onClickSubmit}
                    />
                  </div>
                </div>
              }
            />
          }
        />
      </div>
    );
  }
}

export default SkybotRun;
