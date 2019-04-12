// React e Prime React
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import SkybotApi from 'views/SolarSystems/SkybotApi';
// interface components
import { Card } from 'primereact/card';
import Lightbox from 'react-images';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import ListStats from 'components/Statistics/ListStats.jsx';

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
    },
    {
      field: 'd',
      header: 'd',
      sortable: false,
    },
    {
      field: 'epoch',
      header: 'epoch',
      sortable: false,
    },
  ]
  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const skybotrun = params.skybotrun;
    const expnum = params.expnum;

    this.api.getSkybotResultByExposure(skybotrun, expnum).then(res => {
      const data = res.data;
      this.setState({
        skybotrun: skybotrun,
        expnum: expnum,
        skybotOutput: data.rows,
      });
    });

    this.api.getExposurePlot(skybotrun, expnum).then(res => {
      const data = res.data;

      this.setState({
        ccds: data.ccds,
        plot_src: this.api.api + data.plot_src,
        plot_filename: data.plot_filename,
      })

      // this.setState({
      //   skybotrun: skybotrun,
      //   expnum: expnum,
      //   skybotOutput: data.rows,
      // });
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

    const { skybotOutput, expnum, plot_src } = this.state;

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
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ExposureDetail);
