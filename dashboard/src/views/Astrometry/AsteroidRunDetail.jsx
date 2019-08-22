import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import moment from 'moment';
import PraiaApi from './PraiaApi';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import ListStats from 'components/Statistics/ListStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize';
import { TreeTable } from 'primereact/treetable';
import Log from '../../components/Dialog/Log';
import tableContent from '../Astrometry/assets/astrometry_table_content.json';



const outputs = {
  D00512549_z_c51_r2379p01_immasked: [],
  D00512548_z_c54_r2379p01_immasked: [],
  D00512547_i_c55_r2379p01_immasked: [],
  D00507395_z_c23_r2379p01_immasked: [],
  D00507394_z_c55_r2379p01_immasked: [],
  D00507393_i_c48_r2379p01_immasked: [],
  D00364726_g_c56_r2166p01_immasked: [
    {
      catalog: null,
      filename: 'D00364726_g_c56_r2166p01_immasked.mes',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.mes',
      file_size: 0,
      extension: '.mes',
    },
    {
      catalog: null,
      filename: 'D00364726_g_c56_r2166p01_immasked.reg',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.reg',
      file_size: 25492,
      extension: '.reg',
    },
    {
      catalog: 'gaia1',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia1.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia1.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia2',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia2.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia2.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia3',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia3.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia3.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia4',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia4.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia4.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia5',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia5.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia5.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia6',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia6.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia6.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia7',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia7.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia7.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'ucac4',
      filename: 'D00364726_g_c56_r2166p01_immasked.ucac4.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.ucac4.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'ucac5',
      filename: 'D00364726_g_c56_r2166p01_immasked.ucac5.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.ucac5.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
    {
      catalog: 'gaia_dr2',
      filename: 'D00364726_g_c56_r2166p01_immasked.gaia_dr2.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00364726_g_c56_r2166p01_immasked.gaia_dr2.rad.xy',
      file_size: 301378,
      extension: '.xy',
    },
  ],
  D00503010_z_c30_r2378p01_immasked: [
    {
      catalog: null,
      filename: 'D00503010_z_c30_r2378p01_immasked.mes',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.mes',
      file_size: 0,
      extension: '.mes',
    },
    {
      catalog: null,
      filename: 'D00503010_z_c30_r2378p01_immasked.reg',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.reg',
      file_size: 33857,
      extension: '.reg',
    },
    {
      catalog: 'gaia1',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia1.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia1.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia2',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia2.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia2.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia3',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia3.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia3.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia4',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia4.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia4.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia5',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia5.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia5.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia6',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia6.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia6.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia7',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia7.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia7.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'ucac4',
      filename: 'D00503010_z_c30_r2378p01_immasked.ucac4.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.ucac4.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'ucac5',
      filename: 'D00503010_z_c30_r2378p01_immasked.ucac5.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.ucac5.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
    {
      catalog: 'gaia_dr2',
      filename: 'D00503010_z_c30_r2378p01_immasked.gaia_dr2.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00503010_z_c30_r2378p01_immasked.gaia_dr2.rad.xy',
      file_size: 401280,
      extension: '.xy',
    },
  ],
  D00506424_z_c35_r2379p01_immasked: [
    {
      catalog: null,
      filename: 'D00506424_z_c35_r2379p01_immasked.mes',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.mes',
      file_size: 0,
      extension: '.mes',
    },
    {
      catalog: null,
      filename: 'D00506424_z_c35_r2379p01_immasked.reg',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.reg',
      file_size: 28677,
      extension: '.reg',
    },
    {
      catalog: 'gaia1',
      filename: 'D00506424_z_c35_r2379p01_immasked.gaia1.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.gaia1.rad.xy',
      file_size: 339416,
      extension: '.xy',
    },
    {
      catalog: 'gaia2',
      filename: 'D00506424_z_c35_r2379p01_immasked.gaia2.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.gaia2.rad.xy',
      file_size: 339416,
      extension: '.xy',
    },
    {
      catalog: 'gaia3',
      filename: 'D00506424_z_c35_r2379p01_immasked.gaia3.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.gaia3.rad.xy',
      file_size: 339416,
      extension: '.xy',
    },
    {
      catalog: 'gaia4',
      filename: 'D00506424_z_c35_r2379p01_immasked.gaia4.rad.xy',
      filepath:
        '/data/proccess/4/objects/Eris/D00506424_z_c35_r2379p01_immasked.gaia4.rad.xy',
      file_size: 339416,
      extension: '.xy',
    },
  ],
};







export default class AsteroidRunDetail extends Component {
  state = this.initialState;
  api = new PraiaApi();




  // static propTypes = {
  //     match: PropTypes.object.isRequired,
  //     history: PropTypes.any.isRequired,
  //   };

  get initialState() {
    return {
      id: 0,
      asteroid: {},
      inputs: [],
      files: [],
      prev: null,
      next: null,
      download_icon: 'fa fa-cloud-download',
      praiaId: 0,
      proccess: null,
      catalogName: null,
      output_content: null,
      log_visible: false,
      header: null,
      selectedNodeKey1: [],
      expandedKeys: [],
      astrometryTable: tableContent,
    };
  }

  input_columns = [
    {
      field: 'input_type',
      header: 'Input Type',
      sortable: true,
    },
    {
      field: 'h_file_size',
      header: 'File Size',
      sortable: true,
    },

    {
      field: 'filename',
      header: 'Filename',
      sortable: true,
    },
  ];

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const asteroid_id = params.id;
    this.api.getAsteroidById(asteroid_id).then(res => {
      this.setState({
        asteroid: res.data,
        proccess: res.data.proccess_displayname,
        catalogName: res.data.catalog_name,
      });
    });

    // Recuperar os Inputs
    this.api.getInputsByAsteroidId({ id: asteroid_id }).then(res => {
      const inputs = res.data.results;

      this.setState({
        inputs: inputs,
      });
    });
  }

  onClickBackToAstrometryRun = praia_run => {
    const history = this.props.history;
    history.push({ pathname: `/astrometry_run/${praia_run}` });
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() =>
              this.onClickBackToAstrometryRun(
                this.state.asteroid.astrometry_run
              )
            }
          />
          <Button
            label="Download"
            icon={this.state.download_icon}
            className="ui-button-info"
            disabled="disabled"
          // onClick={() => this.onClickDownload(this.state.asteroid.id)}
          />
        </div>

        <div className="ui-toolbar-group-right">
          <Button
            label="Prev"
            icon="fa fa-arrow-left"
            disabled={this.state.prev ? false : true}
            onClick={() => this.onClickPrev(this.state.prev)}
          />
          <Button
            label="Next"
            icon="fa fa-arrow-right"
            iconPos="right"
            disabled={this.state.next ? false : true}
            onClick={() => this.onClickNext(this.state.next)}
          />
        </div>
      </Toolbar>
    );
  };

  onClickPrev = prev => {
    const history = this.props.history;
    history.push({ pathname: `${prev}` });
    // TODO nao deveria usar reload aqui.
    window.location.reload();
  };

  onClickNext = next => {
    const history = this.props.history;
    history.push({ pathname: `${next}` });
    window.location.reload();
  };

  handleView = rowData => {
    const proccess = this.state.proccess;

    const filepath = encodeURIComponent(rowData.file_path);
    const filename = encodeURIComponent(rowData.filename);
    const title = encodeURIComponent(
      'Process: ' +
      proccess +
      ' of the asteroid ' +
      rowData.asteroid +
      '. \u00a0 File: ' +
      rowData.filename
    );

    const history = this.props.history;
    history.push(`/astrometry_read_csv/${filepath}/${filename}/${title}`);
  };

  actionTemplate = rowData => {
    if (rowData.file_type === 'csv') {
      return (
        <Button
          type="button"
          icon="fa fa-search"
          className="ui-button-info"
          title="View"
          onClick={() => this.handleView(rowData)}
        />
      );
    }
  };

  format_ccd = ccd_name => {
    const arr = ccd_name.split('_');

    return arr[0] + ' ' + arr[1];
  };

  renderOutputTreeTable = outputs => {
    const columns = [
      {
        field: 'filename',
        header: 'Filename',
        style: { width: '40%' },
        expander: true,
        sortable: true,
      },
      {
        field: 'catalog',
        header: 'Ref. Catalog',
        style: {
          width: '15%',
          textAlign: 'center',
        },
        sortable: true,
      },
      {
        field: 'file_size',
        header: 'File size',
        sortable: false,
      },
      {
        field: 'extension',
        header: 'File type',
        sortable: true,
        style: {
          width: '10%',
          textAlign: 'center',
        },
      },
      {
        field: 'actionBtn',
        style: {
          textAlign: 'center',
          width: '10%',
        },
      },
    ];

    const elColumns = columns.map((col, i) => {
      return (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          style={col.style}
          expander={col.expander ? true : false}
        />
      );
    });
    return (
      <TreeTable
        value={outputs}
        resizableColumns={true}
        scrollable
        scrollHeight="200px"
        columnResizeMode="expand"
      // expandedKeys={this.state.expandedKeys}
      // onToggle={e => {
      //   this.setState({ expandedKeys: e.value })
      // }}

      //Component treeTable was updated but primereact documentation doesnt.
      //TODO: Check previous documentation to try to solve the problem
      // selectionMode="single"
      // selectionKeys={this.state.selectedNodeKey1}
      // selectionChange={e => this.setState({ selectedNodeKey1: e }, () => {
      //   console.log(this.state.selectedNodeKey1);
      // })}
      >
        {elColumns}
        <Column />
      </TreeTable>
    );
  };

  openFileBtn = record => {
    return (
      <Button
        className="ui-button-warning"
        icon="fa fa-file-text-o"
        onClick={() => this.handleClickOutput(record)}
      />
    );
  };

  //Go from here
  handleClickOutput = record => {
    this.api.readOutputFile(record.filepath).then(res => {
      const output = res.data.rows;
      this.setState({
        output_content: output,
        log_visible: true,
        header: record.filename,
      });
    });
  };

  onLogHide = () => {
    this.setState({ log_visible: false, output_content: null });
  };


  astrometry_columns = [
    {
      field: 'ra',
      header: "Ra",
      sortable: false,
      style: { textAlign: "center" }
    },
    {
      field: 'dec',
      header: "Dec",
      sortable: false,
      style: { textAlign: "center" }
    },
    {
      field: 'mag',
      header: "Mag",
      sortable: false,
      style: { textAlign: "center" }
    },
    {
      field: 'julian_date',
      header: "Julian Date",
      sortable: false,
      style: { textAlign: "center" }
    },
    {
      field: 'cod_obs',
      header: "Obs. Code",
      sortable: false,
      style: { textAlign: "center" }
    },

    {
      field: 'catalog_code',
      header: "Catalog Code",
      sortable: false,
      style: { textAlign: "center" }
    },
  ]



  render() {
    const { asteroid, inputs } = this.state;


    const a = [];

    Object.keys(outputs).forEach((ccd_name, index) => {
      const a_childrens = [];
      if (outputs[ccd_name].length > 0) {
        outputs[ccd_name].forEach((file, idx) => {
          const children = {
            data: {
              filename: file.filename,
              catalog: file.catalog,
              filepath: file.filepath,
              // file_size: humanize.filesize(file.file_size),
              extension: file.extension,
              actionBtn: this.openFileBtn(file),
              selectable: true,
              leaf: true,
            },
            children: [],
          };
          a_childrens.push(children);
        });
      }

      const ccd = {
        data: {
          filename:
            this.format_ccd(ccd_name) + ' ( ' + a_childrens.length + ' files)',
        },
        children: a_childrens,
      };

      a.push(ccd);
    });

    const inp_columns = this.input_columns.map((col, i) => {
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

    let title = asteroid.name;
    if (asteroid.number && asteroid.number !== '-') {
      title = title + ' - ' + asteroid.number;
    }

    const stats = [
      { name: 'Process', value: asteroid.proccess_displayname },
      { name: 'Asteroid', value: asteroid.name },
      { name: 'Execution Time', value: asteroid.h_execution_time },
      { name: 'CCDs', value: asteroid.ccd_images },
      { name: 'Reference Catalog', value: this.state.catalogName },
      { name: 'Catalog Rows', value: asteroid.catalog_rows },
    ];


    const astrometry_cols = this.astrometry_columns.map((col, i) => {
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
      <div>
        {this.create_nav_bar()}
        <div className="ui-g">


          <div className="ui-lg-4 ui-xl-3">
            <ListStats
              title={title}
              statstext={asteroid.status}
              status={true}
              data={stats}
            />
          </div>

          <div className="ui-g-12">
            <PanelCostumize
              title="Astrometry"
              content={
                <DataTable
                  scrollable={true}
                  scrollHeight="200px"
                  value={tableContent}
                // sortField={""}
                // sortOrder={""}
                >

                  {astrometry_cols}

                  {/* <Column
              style={{}}
              body={"TO DO ACTION TEMPLATE - MAYBE"}
            /> */}
                </DataTable>
              }
            />
          </div>

          <div className="ui-g-12">
            <PanelCostumize
              title="Input"
              content={
                <DataTable
                  value={inputs}
                  sortField={'input_type'}
                  sortOrder={1}
                >
                  {inp_columns}
                  <Column
                    style={{ textAlign: 'center' }}
                    body={this.actionTemplate}
                  />
                </DataTable>
              }
            />
          </div>


          <div className="ui-g-12">
            <PanelCostumize
              title="Output"
              content={this.renderOutputTreeTable(a)}
            />
          </div>
          <Log
            header={this.state.header}
            visible={this.state.log_visible}
            onHide={this.onLogHide}
            content={this.state.output_content}
            dismissableMask={true}
          />
        </div>
      </div>
    );
  }
}
