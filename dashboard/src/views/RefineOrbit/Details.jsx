import React, { Component } from 'react';
// import Card from 'components/Card/Card.jsx';
//import BootstrapTable from 'react-bootstrap-table-next';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import overlayFactory from 'react-bootstrap-table2-overlay';
// import PropTypes from 'prop-types';
// import { formatDateUTC, formatColumnHeader, formatStatus } from 'utils';
import { Messages } from 'primereact/messages';
import { Message } from 'primereact/message';
import OrbitApi from './OrbitApi';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ListGroup, ListGroupItem, Grid, Row, Col } from 'react-bootstrap';
import download from 'assets/img/download.jpeg';
import plot1 from 'assets/img/1.png';
import plot2 from 'assets/img/2.png';
import plot3 from 'assets/img/3.png';
import plot4 from 'assets/img/4.png';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
// import { Lightbox } from 'primereact/lightbox';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Panel } from 'primereact/panel';

class RefineOrbitDetail extends Component {
  state = this.initialState;
  api = new OrbitApi();

  get initialState() {
    return {
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
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.sizePerPage);
    // this.api
    //   .getRefineOrbits(1)
    //   .then(data => this.setState({ cars: data }, console.log(data.data)));

    const data = [
      {
        id: '0001',
        input_displayname: '2013 RR98',
        input_list: '1',
        owner: 'KBO>SDO',
        proccess: '61.470785',
        proccess_displayname: '-16.250106',
        start_time: '2018-07-24T17:40:02.878925Z',
        status: <Button icon="pi pi-check" className="ui-button-success" />,
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
          <Button
            icon="pi pi-exclamation-triangle "
            className="ui-button-warning"
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
        status: <Button icon="pi pi-times " className="ui-button-danger" />,
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

  render() {
    const item = [
      { label: '5', value: '5' },
      { label: '10', value: '10' },
      { label: '15', value: '15' },
    ];

    const cols = [
      // { field: 'id', header: 'id' },
      { field: 'input_displayname', header: 'Name' },
      { field: 'owner', header: 'Dinamics class' },
      { field: 'proccess', header: 'RA' },
      { field: 'proccess_displayname', header: 'Dec' },
      // { field: 'start_time', header: 'S' },
      { field: 'status', header: 'Status' },
    ];

    const dynamicColumns = cols.map((col, i) => {
      return (
        <Column
          rowClassName={this.rowClassName}
          key={col.field}
          field={col.field}
          header={col.header}
        />
      );
    });

    const header = <img alt="Card" height="20" src={download} />;
    const preview = [];
    const lenght = this.state.valor;
    for (let index = 1; index <= lenght; index++) {
      preview.push(
        <AccordionTab header={`2013 RR98 ${index}`}>
          <Grid>
            <Row>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img width="525" height="380" src={plot1} />
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img width="525" height="380" src={plot2} />
                </Card>
              </Col>
            </Row>
            <br />
            <Row>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum Lorem ipsum Lorem ipsum"
                >
                  <img width="525" height="380" src={plot3} />
                </Card>
              </Col>
              <Col md={6}>
                <Card
                  title="Preview"
                  subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                >
                  <img width="525" height="380" src={plot4} />
                </Card>
              </Col>
            </Row>
          </Grid>
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
              //header={header}
            >
              <div className="ui-g">
                <div className="ui-md-6">
                  <Panel>
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
                  </Panel>
                </div>
              </div>
              {/* <div className="ui-md-12">
                <h2>
                  <Message
                    severity="success"
                    text="Success"
                    detail="Validation failed"
                    //style={{ width: 750 + 'px', height: 80 + 'px' }}
                  />
                </h2>
              </div> */}
            </Card>
          </div>
        </div>
        <br />
        <br />
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
          </Toolbar>
          <Accordion>{preview}</Accordion>
        </Card>
        <br />
        <br />
        {/* <BootstrapTable
          striped
          hover
          condensed
          remote
          bordered={true}
          keyField="id"
          columns={columns}
          data={data}
        /> */}
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
              />
            </div>
          </Toolbar>
          <div className="content-section implementation">
            <DataTable
              selectionMode="single"
              style={{ border: 1 + 'px solid #A9A9A9' }}
              value={this.state.cars}
              selection={this.state.selected2}
              onSelectionChange={e => this.setState({ selected2: e.data })}
            >
              {/* <Column selectionMode="single" style={{ width: '2em' }} /> */}
              {dynamicColumns}
            </DataTable>
          </div>
        </Card>
      </div>
    );
  }
}
export default RefineOrbitDetail;
