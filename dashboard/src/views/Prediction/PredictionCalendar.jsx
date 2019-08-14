import React, { Component } from 'react';
import { Card } from 'primereact/card';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import '@fullcalendar/bootstrap/main.css';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import "@fullcalendar/timegrid/main.css";
import '@fullcalendar/list/main.css';
import PredictionApi from './PredictionApi';
import json from '../Prediction/assets/Prediction.json';



export default class PredictionCalendar extends Component {

  api = new PredictionApi();

  calendarRef = React.createRef();


  state = {
    defaultDate: new Date(),
    defaultView: 'dayGridMonth',
    predictionEvents: null,
    log_visible: false,
    calendar_content: null,
    calendarApi: null,

  }

  handleDateClick = (e) => {

    console.log(e);
  };

  handleEvent = (e) => {
    let id = e.event.id;

    //  console.log(e.event.setProp("title", "<em>oi<em>"));


    //console.log(e.event.setProp("classNames", "<i class=fa fa-undo></i>"));

    // console.log(e.event.setProp(e.el.innerHTML, <i className='fa fa-undo'></i>));

    // console.log(e.event.setProp(e.el.innerHTML));




    console.log(this.state.calendarApi);



    // console.log(e.event.setProp("title", parse.transform(<i class='fa fa-undo'></i>)));





    const history = this.props.history;
    history.push({ pathname: `/occultation_detail/${id}` });

  };




  componentDidMount() {

    this.setState({ calendarApi: this.calendarRef.current.getApi() });
    // console.log(calendarApi);
  }


  componentWillMount() {
    this.fetchData();

  };




  fetchData = () => {

    let arrayEvents = []
    let result = [];

    let keys = Object.keys(json);

    keys.forEach(function (key) {
      result.push(json[key]);
    });
    result[3].map((res, idx) => {

      arrayEvents.push({ id: res.id, title: res.asteroid_name, date: res.date_time, textColor: 'white' });
    });

    this.setState({ predictionEvents: arrayEvents });

  };




  reload_calender = (start_date, end_date) => {
    console.log("Inittial: ", start_date);
    console.log("Final: ", end_date);
  };



  //Control when change the header buttons.
  handleDateRender = (arg) => {

    // console.log("Start: ", arg.view.currentStart);
    // console.log("End: ", arg.view.currentEnd);

    let start_date = arg.view.currentStart;
    let end_date = arg.view.currentEnd;


    if (this.state.calendarApi !== null) {
      // console.log(this.state.calendarApi.view);

      this.reload_calender(start_date, end_date);

    }


  }



  handleEventRender = (event) => {
    // if (event.icon) {
    //   // element.find(".fc-title").prepend("<i class='fa fa-"+event.icon+"'></i>");
    //   
    // }

    // console.log(event);

    // event.el.classList.(<i class='fa-undo'></i>);


    // if (event) {
    //   // console.log(event.event.setProp(event.el.innerHTML, "<div class='fc-content'><span class='fc-time'>11:32a</span> <span class='fc-title'>2004 DA62 uy</span></div>"));
    //   // console.log(event.el.setProp("innerHTML", "red"));

    //   console.log(event);

    // }

    console.log(event);

    // console.log(event.event.setProp(event.el.innerText, "<em>oi<em>"));

    //console.log(event.el.innerHTML);
    // event.event.setProp(event.event.title, "opa");

  };




  render() {
    const { defaultDate, defaultView, predictionEvents, } = this.state;



    // if (this.calendarRef.current !== null) {
    //   console.log(this.calendarRef.current.props.header);
    // }



    const events =
      [
        { title: "2004 DA62 ", date: '2019-08-10 11:32:00', textColor: 'white', },
        { id: 'a', title: "oi", date: '2019-08-12 17:30:00', textColor: 'white', backgroundColor: "green", },
      ]




    const header = {
      center: 'title',
      right: 'prev,next, myFirstCustomButton, mySecondCustomButton',
      month: 'month',
      listYear: 'Year',
      left: 'dayGridDay,dayGridWeek,dayGridMonth,listYear',

    }


    //Variable used to change to specific button name
    const buttonText = {
      listYear: 'year',
      month: 'month',

    }


    return (
      <div>
        <Card>
          <FullCalendar

            header={header}
            buttonText={buttonText}
            defaultDate={this.state.defaultDate}
            themeSystem={"standard"}
            events={predictionEvents}
            // events={events}

            eventClick={this.handleEvent}
            defaultView={defaultView}
            plugins={[bootstrapPlugin, dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
            dateClick={this.handleDateClick}
            weekNumbers={true}
            datesRender={this.handleDateRender}

            ref={this.calendarRef}

            eventRender={this.handleEventRender}

          // customButtons={{
          //   myFirstCustomButton: {
          //     text: 'custom1', click: function () {
          //       alert("Clicked");
          //     }
          //   },
          //   mySecondCustomButton: {
          //     text: 'custom2', click: function () {
          //       alert("Clicked");
          //     }
          //   },

          // }}


          />

        </Card>


      </div >
    );
  }

}