// React e Prime React
import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Api Rest
import OrbitApi from './OrbitApi';
// interface components
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
// import { Tree } from 'primereact/tree';
import { Dialog } from 'primereact/dialog';
import Lightbox from 'react-images';
import { Tree } from 'primereact/tree';
import { Panel } from 'primereact/panel';
//importing images
import plot1 from 'assets/img/1.png';
import plot2 from 'assets/img/2.png';
import plot3 from 'assets/img/3.png';
import plot4 from 'assets/img/4.png';
import download from 'assets/img/download.jpeg';
import { ScrollPanel } from 'primereact/scrollpanel';
// import SlideImage from 'views/RefineOrbit/SlideImage.jsx';
import Log from 'views/RefineOrbit/Log.jsx';
import { Message } from 'primereact/message';
import { TreeTable } from 'primereact/treetable';

const images = [{ src: plot1 }, { src: plot2 }, { src: plot3 }, { src: plot4 }];

const data = [
  {
    data: {
      name: 'Documents',
      size: '75kb',
      type: 'Folder',
    },
    children: [
      {
        data: {
          name: 'Work',
          size: '55kb',
          type: 'Folder',
        },
        children: [
          {
            data: {
              name: 'Expenses.doc',
              size: '30kb',
              type: 'Document',
            },
          },
          {
            data: {
              name: 'Resume.doc',
              size: '25kb',
              type: 'Resume',
            },
          },
        ],
      },
      {
        data: {
          name: 'Home',
          size: '20kb',
          type: 'Folder',
        },
        children: [
          {
            data: {
              name: 'Invoices',
              size: '20kb',
              type: 'Text',
            },
          },
        ],
      },
    ],
  },
  {
    data: {
      name: 'Pictures',
      size: '150kb',
      type: 'Folder',
    },
    children: [
      {
        data: {
          name: 'barcelona.jpg',
          size: '90kb',
          type: 'Picture',
        },
      },
      {
        data: {
          name: 'primeui.png',
          size: '30kb',
          type: 'Picture',
        },
      },
      {
        data: {
          name: 'optimus.jpg',
          size: '30kb',
          type: 'Picture',
        },
      },
    ],
  },
];

class RefineOrbitDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  get initialState() {
    return {
      id: '',
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      // Tempo em segundos entre cada reload da lista
      reload_interval: 10,
      selected: [],
      selected_record: null,
      cars: [],
      valor: '5',
      selected2: '',
      lightboxIsOpen: false,
      currentImage: 0,
      visible: false,
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);

    // Array of table rows
    const data = [
      {
        id: '0001',
        input_displayname: '2013 RR98',
        input_list: '1',
        owner: 'KBO>SDO',
        proccess: '61.470785',
        proccess_displayname: '-16.250106',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-check "
            style={{ fontSize: '1.5em', color: 'green' }}
          />
        ),
      },
      {
        id: '0002',
        input_displayname: '2013 RR98',
        input_list: '2',
        owner: 'KBO>SDO',
        proccess: '93.63396',
        proccess_displayname: '-45.186892',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-exclamation-triangle"
            style={{ fontSize: '1.5em', color: '#FF8C00' }}
          />
        ),
      },
      {
        id: '0003',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
      {
        id: '0004',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
      {
        id: '0005',
        input_displayname: '2014 RR98',
        input_list: '3',
        owner: 'KBO>SDO',
        proccess: '93.634311',
        proccess_displayname: '-45.186462',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: (
          <i
            className="pi pi-times"
            style={{ fontSize: '1.5em', color: '#B22222' }}
          />
        ),
      },
    ];
    this.setState({ cars: data });
  }

  fetchData = (page, sizePerPage) => {
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api.getOrbitRuns({ page: page, pageSize: sizePerPage }).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        sizePerPage: sizePerPage,
        loading: false,
      });
    });
  };

  // Methods for slide operation
  Slideshow = () => {
    this.setState({ lightboxIsOpen: true });
  };
  gotoNextLightboxImage = () => {
    this.setState({
      currentImage: this.state.currentImage + 1,
    });
  };
  gotoPrevLightboxImage = () => {
    this.setState({
      currentImage: this.state.currentImage - 1,
    });
  };
  CloseLightbox = () => {
    this.setState({ lightboxIsOpen: false });
  };
  handleClickImage = () => {
    if (this.state.currentImage === images.length - 1) return;
    this.gotoNextLightboxImage();
  };
  onClick = () => {
    const row = this.state.selected2;
    if (!row) {
      alert('Nenhum registro selecionado');
    } else {
      this.setState({ id: row });
      this.setState({ visible: true });
      console.log(this.state.id);
    }
  };
  onHide = () => {
    this.setState({ visible: false });
  };
  // Render

  render() {
    //Array with the amount of previews
    const item = [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '15', value: '15' },
    ];

    // Array with table columns
    const cols = [
      { field: 'input_displayname', header: 'Name' },
      { field: 'owner', header: 'Dinamics class' },
      { field: 'proccess', header: 'RA' },
      { field: 'proccess_displayname', header: 'Dec' },
      { field: 'status', header: 'Status' },
    ];

    // Filling the columns
    const dynamicColumns = cols.map((col, i) => {
      return (
        <Column
          rowClassName={this.rowClassName}
          key={i.field}
          field={col.field}
          header={col.header}
          style={{ textAlign: 'center' }}
        />
      );
    });
    //
    const header = <img alt="Card" height="20" src={download} />;
    const preview = [];
    const lenght = this.state.valor;
    for (let index = 1; index <= lenght; index++) {
      preview.push(
        <AccordionTab header={`2013 RR98 ${index}`}>
          <Panel header={`Plot object 2013 RR98 ${index}`}>
            <div className="ui-g">
              <div className="ui-md-12">
                <div className="ui-g-12">
                  <img
                    // style={{ width: 'inherit' }}
                    onClick={this.Slideshow}
                    width="325"
                    height="280"
                    src={plot1}
                  />
                  <img
                    // style={{ width: 'inherit' }}
                    onClick={this.Slideshow}
                    width="325"
                    height="280"
                    src={plot2}
                  />
                  {/* </div>
                <div className="ui-g-12"> */}
                  <img
                    // style={{ width: 'inherit' }}
                    onClick={this.Slideshow}
                    width="325"
                    height="280"
                    src={plot3}
                  />
                  <img
                    // style={{ width: 'inherit' }}
                    onClick={this.Slideshow}
                    width="325"
                    height="280"
                    src={plot4}
                  />
                </div>
              </div>
            </div>
          </Panel>

          {/* <ScrollPanel header="Plot objects"> */}

          <br />
          <Panel header="Tree of archive">
            {/* <Tree
              value={data}
              style={{ height: '200px', width: '500px', fontSize: '1.5em' }}
            /> */}
            <TreeTable value={data} header="Basic">
              <Column field="name" header="Name" />
              <Column field="size" header="Size" />
              <Column field="type" header="Type" />
            </TreeTable>
          </Panel>
          {/* </ScrollPanel> */}
        </AccordionTab>
      );
    }
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-md-6">
            <Card
              header={header}
              title="Execution Statistics"
              style={{ border: 1 + 'px solid #A9A9A9' }}
              subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. "
            >
              <div className="ui-g">
                <div className="ui-md-6">
                  <ListGroup>
                    <ListGroupItem>
                      Total de Objetos de entrada&nbsp;:&nbsp;&nbsp;
                      <strong>5</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Total de objetos excecutados&nbsp;:&nbsp;&nbsp;
                      <strong>4</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Total de objetos falhados&nbsp;:&nbsp;&nbsp;
                      <strong>0</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Tempo de execução&nbsp;:&nbsp;&nbsp;
                      <strong>00:02:10</strong>
                    </ListGroupItem>
                    <ListGroupItem>
                      Tempo médio por objeto&nbsp;:&nbsp;&nbsp;
                      <strong>00:00:23</strong>
                    </ListGroupItem>
                  </ListGroup>
                </div>

                <div className="content-section implementation">
                  <div className="ui-md-6">
                    {/* <Tree className=" ui-tree ui-tree-container"  value={dt} /> */}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="ui-md-6">
          </div>
        </div>
        <br />
        <br />
        <Lightbox
          images={images}
          isOpen={this.state.lightboxIsOpen}
          onClickPrev={this.gotoPrevLightboxImage}
          onClickNext={this.gotoNextLightboxImage}
          onClose={this.CloseLightbox}
          currentImage={this.state.currentImage}
          onClickImage={this.handleClickImage}
        />
        {/* <SlideImage /> */}

        <Card
          style={{ border: 1 + 'px solid #A9A9A9' }}
          title="Preview"
          subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
        >
          <Toolbar>
            <Dropdown
              style={{ width: '250px' }}
              value={this.state.valor}
              options={item}
              onChange={e => {
                this.setState({ valor: e.value });
              }}
              placeholder="Select a value"
            />
            <Accordion>{preview}</Accordion>
          </Toolbar>
        </Card>
        <br />
        <br />
        <Card
          style={{ border: 1 + 'px solid #A9A9A9' }}
          title="Table of Objects"
          subTitle="Curabitur id lacus est. Donec erat sapien, dignissim ut arcu sed."
        >
          <Toolbar>
            <div className="ui-toolbar-group-left">
              <Button label="View" icon="pi pi-plus" />
              <Button
                label="Log"
                icon="pi pi-file"
                className="ui-button-warning"
                onClick={this.onClick}
              />
            </div>
          </Toolbar>
          <Log
            visible={this.state.visible}
            onHide={this.onHide}
            id={this.state.id}
          />
          <div className="content-section implementation">
            <DataTable
              selectionMode="single"
              style={{ border: 1 + 'px solid #A9A9A9', textAlign: 'center' }}
              value={this.state.cars}
              selection={this.state.selected2}
              onSelectionChange={e => this.setState({ selected2: e.data })}
            >
              {dynamicColumns}
            </DataTable>
          </div>
        </Card>
      </div>
    );
  }
}
export default RefineOrbitDetail;
