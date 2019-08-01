// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import SkybotApi from 'views/SolarSystems/SkybotApi';
// interface components
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { InputSwitch } from 'primereact/inputswitch';
class ExposureDetail extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      skybotrun: null,
      expnum: null,
      showAllSkybot: false,
    };
  }
  columns = [
    {
      field: 'num',
      header: 'Object Number',
      sortable: false,
    },
    {
      field: 'name',
      header: 'Object Name',
      sortable: false,
    },
    {
      field: 'dynclass',
      header: 'DynClass',
      sortable: false,
    },
    {
      field: 'ccdnum',
      header: 'CCD Num',
      sortable: false,
    },
    {
      field: 'ra',
      header: 'RA',
      sortable: false,
    },
    {
      field: 'dec',
      header: 'Dec',
      sortable: false,
    },
    {
      field: 'mv',
      header: 'mv',
      sortable: false,
    },
    {
      field: 'errpos',
      header: 'errpos (arcsec)',
      sortable: false,
      body: rowData => {
        return rowData.errpos.toFixed(3)
      }
    },
    {
      field: 'd',
      header: 'd (arcsec)',
      sortable: false,
      body: rowData => {
        return rowData.errpos.toFixed(2)
      }
    },
    {
      field: 'epoch',
      header: 'epoch',
      sortable: false,
    },
  ];
  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const skybotrun = params.skybotrun;
    const expnum = params.expnum;

    this.api.getSkybotResultByExposure(skybotrun, expnum).then(res => {
      const { rows } = res.data;

      this.api.getExposurePlot(skybotrun, expnum).then(res => {
        const { ccds, plot_src, plot_filename } = res.data;

        this.api.getAsteroidsInsideCCD(expnum).then(res => {
          const asteroidCcds = res.data.rows;

          this.setState({
            skybotrun: skybotrun,
            expnum: expnum,
            skybotOutput: rows,
            asteroidCcds: asteroidCcds,
            ccds: ccds,
            plot_src: this.api.api + plot_src,
            plot_filename: plot_filename,
          }, () => {
            console.log(this.state.skybotOutput);
          });
        });
      });
    });
  }

  create_nav_bar = () => {
    const { skybotrun } = this.state;

    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBack(skybotrun)}
          />
        </div>

        <div className="ui-toolbar-group-right" />
      </Toolbar>
    );
  };

  onClickBack = skybotrun => {
    const history = this.props.history;
    history.push({ pathname: `/skybotrun_detail/${skybotrun}` });
  };

  render() {
    // const asteroid = this.state.asteroid;



    const {
      skybotOutput,
      asteroidCcds,
      expnum,
      plot_src,
      showAllSkybot,
    } = this.state;





    const columns = this.columns.map((col, i) => {
      return (
        <Column
          key={i}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          style={col.style}
          body={col.body}
        />
      );
    });

    const switchLabel =
      showAllSkybot === true
        ? 'All Skybot output'
        : 'Only Asteroids inside CCD';

    return (
      <div className="content">
        {this.create_nav_bar()}
        <div className="ui-g">
          <div className="ui-g-4">
            <Card subTitle={`Expnum: ${expnum}`}>
              <img
                // id={e.filename}
                width="100%"
                src={plot_src}
              // alt={e.filename}
              />
            </Card>
          </div>
        </div>
        <div className="ui-g" />
        <div className="ui-g">
          <div className="ui-g-12">
            <span className="p-float-label">
              <InputSwitch
                id="showAllSkybot"
                checked={this.state.showAllSkybot}
                onChange={e => this.setState({ showAllSkybot: e.value })}
                onLabel=""
                offLabel="Only Asteroids inside CCD"
              />
              <label htmlFor="showAllSkybot">{switchLabel}</label>
            </span>

            {showAllSkybot === true ? (
              <Card title="Skybot Outputs" subTitle="">
                <DataTable
                  value={skybotOutput}
                  reorderableColumns={false}
                  reorderableRows={false}
                  responsive={true}
                  scrollable={true}
                >
                  {columns}
                </DataTable>
              </Card>
            ) : (
                <Card title="Asteroids Inside CCD" subTitle="">
                  <DataTable
                    value={asteroidCcds}
                    reorderableColumns={false}
                    reorderableRows={false}
                    responsive={true}
                    scrollable={true}
                  >
                    {columns}
                  </DataTable>
                </Card>
              )}
          </div>
          <div className="ui-g-12" />
        </div>
      </div>
    );
  }
}

export default withRouter(ExposureDetail);
