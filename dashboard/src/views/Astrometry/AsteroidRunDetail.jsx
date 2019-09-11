import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import PraiaApi from './PraiaApi';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import Lightbox from 'react-images';
import { Panel } from 'primereact/panel';
import ListStats from 'components/Statistics/ListStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize';
import { TreeTable } from 'primereact/treetable';
import Log from '../../components/Dialog/Log';
import filesize from 'filesize';
import { findIndex } from 'lodash';

export default class AsteroidRunDetail extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

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
      astrometryTable: [],
      outputCcdsTree: [],
      plots: [],
      currentPlot: 0,
      lightboxIsOpen: false,
      lightboxImages: [],
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const asteroid_id = params.id;

    this.setState({ id: asteroid_id }, () => this.loadData(asteroid_id));
  }

  loadData = asteroid_id => {
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

    // Resultado da Astrometria, dados em formato tabela.
    this.api.read_astrometry_table(asteroid_id).then(res => {
      const rows = res.data.rows;
      this.setState({
        astrometryTable: rows,
      });
    });

    // Outputs do pipeline por ccd
    this.api.getAsteroidOutputsTree(asteroid_id).then(res => {
      const rows = res.data.rows;
      this.setState({
        outputCcdsTree: rows,
      });
    });

    // Plots gerados pelo pipeline
    this.api.getAstrometryPlots(asteroid_id).then(res => {
      const rows = res.data.rows;
      rows.map(row => {
        row.src = this.api.api + row.src;
        return row;
      });
      const images = rows.map(r => {
        return {
          src: r.src,
          thumbnail: r.src,
          title: r.ccd_filename,
        };
      });

      this.setState({
        plots: rows,
        lightboxImages: images,
      });
    });
  };

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
    const title = encodeURIComponent('File: ' + rowData.filename);

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
        field: 'ccd_filename',
        header: 'CCD Filename',
        style: { width: '320px' },
        expander: true,
        sortable: true,
      },
      {
        field: 'expnum',
        header: 'Expnum',
        style: {
          width: '80px',
        },
        sortable: false,
      },
      {
        field: 'ccd_num',
        header: 'CCD',
        style: {
          width: '80px',
        },
        sortable: false,
      },
      {
        field: 'band',
        header: 'Band',
        style: {
          width: '80px',
        },
        sortable: false,
      },
      {
        field: 'count_outputs',
        header: 'Files',
        style: {
          width: '80px',
        },
        sortable: false,
      },
      {
        field: 'type_name',
        header: 'Type',
        style: {
          width: '180px',
          // textAlign: 'center',
        },
        sortable: true,
      },
      {
        field: 'catalog',
        header: 'Ref. Catalog',
        style: {
          width: '120px',
        },
        sortable: true,
      },
      {
        field: 'file_type',
        header: 'Extension',
        sortable: false,
        style: {
          width: '100px',
        },
      },
      {
        field: 'h_size',
        header: 'File size',
        style: {
          width: '100px',
        },
        sortable: true,
      },
      {
        field: 'actionBtn',
        style: {
          textAlign: 'center',
          width: '60px',
        },
      },
      {
        field: 'placeholder',
        style: {
          textAlign: 'center',
          // width: '10%',
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

    const rows = [];

    outputs.map(ccd => {
      var a_children = [];

      ccd.outputs.map(output => {
        var data = output;

        data.h_size = filesize(output.file_size);

        if (data.type == 'astrometry_plot') {
          // TODO implementar uma funcao para abrir uma png.
        } else {
          data.actionBtn = this.openFileBtn(output);
        }

        a_children.push({
          data: data,
          selectable: true,
        });
      });

      var nodeCcd = {
        data: {
          ccd_filename: ccd.ccd_filename,
          expnum: ccd.expnum,
          ccd_num: ccd.ccd_num,
          band: ccd.band,
          count_outputs: ccd.count_outputs,
        },
        children: a_children,
        selectable: false,
      };

      rows.push(nodeCcd);
    });

    return (
      <TreeTable
        value={rows}
        resizableColumns={true}
        scrollable
        scrollHeight="200px"
        columnResizeMode="expand"
      >
        {elColumns}
        <Column />
      </TreeTable>
    );
  };

  renderInputTable = inputs => {
    const columns = [
      {
        field: 'type_name',
        header: 'Input Type',
        sortable: false,
        style: {
          width: '320px',
        },
      },
      {
        field: 'filename',
        header: 'Filename',
        sortable: false,
        style: {
          width: '180px',
        },
      },
      {
        field: 'h_file_size',
        header: 'File Size',
        sortable: false,
        style: {
          width: '100px',
        },
      },
    ];
    const elColumns = columns.map((col, i) => {
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
      <DataTable value={inputs} sortField={'type_name'} sortOrder={1}>
        {elColumns}
        <Column
          style={{ width: '60px', textAlign: 'center' }}
          body={this.actionTemplate}
        />
        <Column />
      </DataTable>
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
    this.api.readOutputFile(record.file_path).then(res => {
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
      header: 'RA',
      sortable: false,
    },
    {
      field: 'dec',
      header: 'Dec',
      sortable: false,
    },
    {
      field: 'mag',
      header: 'mag',
      sortable: true,
    },
    {
      field: 'julian_date',
      header: 'Julian Date',
      sortable: true,
    },
    {
      field: 'obs_code',
      header: 'Obs. Code',
      sortable: false,
      style: { textAlign: 'center' },
    },

    {
      field: 'catalog_code',
      header: 'Catalog Code',
      sortable: false,
      style: { textAlign: 'center' },
    },
  ];

  templateGridItem = record => {
    if (record) {
      return (
        <div style={{ padding: '.5em' }} className="p-col-12 p-md-3">
          <Panel header={record.ccd_filename} style={{ textAlign: 'center' }}>
            <img
              src={record.src}
              alt={record.ccd_filename}
              width={320}
              height={240}
              onClick={e => this.openLightbox(record, e)}
            />
            {/* <hr className="ui-widget-content" style={{ borderTop: 0 }} />
            <Button icon="pi pi-search"
            // onClick={(e) => this.setState({ selectedCar: car, visible: true })}
            >
            </Button> */}
          </Panel>
        </div>
      );
    }
    return <div />;
  };

  dataViewItemTemplate = (record, layout) => {
    if (layout === 'grid') {
      return this.templateGridItem(record);
    }
  };

  renderPlotsDataView = (plots, layout) => {
    return (
      <div>
        <DataView
          value={plots}
          layout={layout}
          itemTemplate={this.dataViewItemTemplate}
          paginator={true}
          rows={12}
        />
      </div>
    );
  };

  openLightbox = (record, event) => {
    const { plots } = this.state;
    const index = findIndex(plots, function (o) {
      return o.id == record.id;
    });

    event.preventDefault();
    this.setState({
      currentPlot: index,
      lightboxIsOpen: true,
    });
  };

  closeLightbox = () => {
    this.setState({
      currentPlot: 0,
      lightboxIsOpen: false,
    });
  };

  lightboxGotoPrevious = () => {
    this.setState({
      currentPlot: this.state.currentPlot - 1,
    });
  };
  lightboxGotoNext = () => {
    this.setState({
      currentPlot: this.state.currentPlot + 1,
    });
  };
  lightboxGotoImage = index => {
    this.setState({
      currentPlot: index,
    });
  };

  render() {
    const {
      asteroid,
      inputs,
      astrometryTable,
      outputCcdsTree,
      plots,
      lightboxImages,
      currentPlot,
      lightboxIsOpen,
    } = this.state;

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
                  scrollHeight="300px"
                  value={astrometryTable}
                  paginator={true}
                  rows={10}
                >
                  {astrometry_cols}
                </DataTable>
              }
            />
          </div>
          <div className="ui-g-12">
            <PanelCostumize
              title="Astrometry Plots CCD x Stars x Asteroid"
              content={this.renderPlotsDataView(plots, 'grid')}
            />
          </div>

          <div className="ui-g-12">
            <PanelCostumize
              title="Input"
              content={this.renderInputTable(inputs)}
            />
          </div>

          <div className="ui-g-12">
            <PanelCostumize
              title="Output"
              content={this.renderOutputTreeTable(outputCcdsTree)}
            />
          </div>
          <Log
            header={this.state.header}
            visible={this.state.log_visible}
            onHide={this.onLogHide}
            content={this.state.output_content}
            dismissableMask={true}
          />
          <Lightbox
            currentImage={currentPlot}
            images={lightboxImages}
            isOpen={lightboxIsOpen}
            onClickNext={this.lightboxGotoNext}
            onClickPrev={this.lightboxGotoPrevious}
            onClose={this.closeLightbox}
          />
        </div>
      </div>
    );
  }
}
