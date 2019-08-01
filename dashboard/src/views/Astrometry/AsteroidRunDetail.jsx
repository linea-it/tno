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
import jsonData from '../Astrometry/Astrometry_Json/test_Json.json';
import treeNodeJson from '../Astrometry/Astrometry_Json/treeNodeJson.json';
import { TreeTable } from 'primereact/treetable';
import humanize from 'humanize';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


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
      selectedNodeKey: null,



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
      style: { textAlign: 'center' }
    },

    {
      field: 'filename',
      header: 'Filename',
      sortable: true,
      style: { textAlign: 'center' }
    },


  ];


  componentWillMount() {
    //Read JSON File hardcoded
    this.json_file = JSON.parse(JSON.stringify(jsonData));
    // this.setState({ jsonFile: JSON.parse(JSON.stringify(jsonData)) });



    this.treeNode = JSON.parse(JSON.stringify(treeNodeJson));


  };

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
      })
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

  // onClickDownload = async asteroid_id => {
  //     // Alterar o Icone do botao para loading
  //     this.setState({
  //         download_icon: 'fa fa-circle-o-notch fa-spin fa-fw',
  //     });

  //     const download_link = await this.api.getAsteroidDownloadLink({
  //         asteroid_id,
  //     });

  //     const data = download_link.data;

  //     if (data.success) {
  //         const file_src = this.api.api + data.src;

  //         // window.location.href = file_src;
  //         window.location.assign(file_src);
  //     } else {
  //         // TODO: Implementar notificacao de erro.
  //     }

  //     // Alterar o Icone do botao para downlaod
  //     this.setState({
  //         download_icon: 'fa fa-cloud-download',
  //     });
  // };


  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() =>
              this.onClickBackToAstrometryRun(this.state.asteroid.astrometry_run)
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

  handleView = (rowData) => {


    const proccess = this.state.proccess;

    const filepath = encodeURIComponent(rowData.file_path);
    const filename = encodeURIComponent(rowData.filename);
    const title = encodeURIComponent("Proccess: " + proccess + " of the asteroid " + rowData.asteroid + ". \u00a0 File: " + rowData.filename);

    const history = this.props.history;
    history.push(`/astrometry_read_csv/${filepath}/${filename}/${title}`);
  }

  actionTemplate = (rowData) => {

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
  }



  actionTemplateTree = (rowData) => {
    return <Button
      type="button"
      icon="pi pi-search"
      className="p-button-success"
      style={{ marginRight: '.5em' }}>
    </Button>

  }

  format_ccd = (ccd_name) => {
    let arr = ccd_name.split("_");

    return arr[0] + " " + arr[1];
  };


  handleTreeRowClick = (row) => {
    console.log(row);
  };

  render() {
    const { asteroid, inputs } = this.state;



    let a = []
    let outputs = this.json_file.outputs

    Object.keys(outputs).forEach((ccd_name, index) => {

      let a_childrens = []
      if (outputs[ccd_name].length > 0) {
        outputs[ccd_name].forEach((file, idx) => {
          let children = {
            data: {
              filename: file.filename,
              catalog: file.catalog,
              filepath: file.filepath,
              file_size: humanize.filesize(file.file_size),
              extension: file.extension,

            },
            children: []
          }
          a_childrens.push(children);
        })
      }

      let ccd = {
        data: {

          filename: this.format_ccd(ccd_name) + ' ( ' + a_childrens.length + ' files)'

        },
        children: a_childrens
      }

      a.push(ccd);
    })



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
      { name: 'Proccess', value: asteroid.proccess_displayname },
      { name: 'Executed', value: asteroid.h_time },
      { name: 'Execution Time', value: asteroid.h_execution_time },
      { name: 'Size', value: asteroid.h_size },
      { name: 'Reference Catalog', value: this.state.catalogName },
    ];

    return (
      <div>
        {this.create_nav_bar()}
        <div className="ui-g">
          <div className="ui-g-4">
            <ListStats
              title={title}
              statstext={asteroid.status}
              status={true}
              data={stats}
            />
          </div>
          <div className="ui-g-12">
            <PanelCostumize
              title="Inputs"
              content={
                <DataTable
                  value={inputs}
                  sortField={'input_type'}
                  sortOrder={1}
                >
                  {inp_columns}
                  {/* <Column
                    style={{ textAlign: 'center' }}
                    body={this.actionTemplate}
                  /> */}
                </DataTable>
              }
            />
          </div>


          <div className="ui-g-12">
            <PanelCostumize
              title="Outputs"
              content={
                <TreeTable value={a} selectionMode="single" onRowClick={this.handleTreeRowClick} selectionKeys={this.state.selectedNodeKey} onSelectionChange={e => this.setState({ selectedNodeKey: e.value })} resizableColumns={true} scrollable scrollHeight="200px" columnResizeMode="expand" >
                  <Column field="filename" header="Filename" expander style={{ width: '30%' }} ></Column>
                  <Column field="catalog" header="Catalog" style={{ textAlign: 'center' }}></Column>
                  <Column field="file_size" header="Size" style={{ textAlign: 'center' }}></Column>
                  <Column field="extension" header="Type" style={{ textAlign: 'center' }}></Column>
                  <Column body={this.actionTemplateTree}></Column>
                </TreeTable>

              }
            />

          </div>


        </div>
      </div>
    );
  }
}