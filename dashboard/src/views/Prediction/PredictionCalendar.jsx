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
// import { back_cookie, read_cookie, delete_cookie, bake_cookie } from 'sfcookies';



export default class PredictionCalendar extends Component {

  api = new PredictionApi();

  calendarRef = React.createRef();


  state = {
    id: null,
    defaultDate: new Date(),
    defaultView: 'dayGridMonth',
    predictionEvents: null,
    log_visible: false,
    calendar_content: null,
    calendarApi: null,
    cookie_key: null,

  }

  componentDidMount() {

    // this.setState({ calendarApi: this.calendarRef.current.getApi() });
    // console.log(calendarApi);



  }



  componentWillMount() {
    this.fetchData();

    const { match: { params } } = this.props;

    if (params.id) {

      let id = params.id;
      let date = new Date(params.default_date);


      this.setState({
        id: id,
        defaultDate: date,
      });
    }
    else {
      console.log("Not yet");
    }

  }





  //COOKIE AREA
  // //Check if cookies are set

  // if (read_cookie('cookie_id')) {
  //   console.log("Cookie id: ", read_cookie('cookie_id'));
  //   console.log("Cookie date: ", read_cookie('cookie_date'));


  //   //Set a new default Date
  //   this.setState({ defaultDate: read_cookie('cookie_date') });

  // } else {
  //   console.log("not defined");
  // }
  //---------------------------------------









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




  reloadCalender = (start_date, end_date) => {
    console.log("Inittial: ", start_date);
    console.log("Final: ", end_date);

  };




  //Controls when click the date area not the event. The event is handleEvent
  handleDateClick = (e) => {

    console.log(e);
  };



  //Controls when the event date/other is select
  handleEvent = (e) => {
    let id = e.event.id;
    let date = e.event.start;
    let view = null;//To do 
    let flag = "calendar";



    const history = this.props.history;
    history.push(`/test_occultation/${id}/${date}/${flag}`);








    // //COOKIE MANAGEMENT AREA
    // //create a cookie key
    // const cookie_id = 'cookie_id';
    // const cookie_date = 'cookie_date';
    // const cookie_view = 'cookie_view';

    // bake_cookie(cookie_id, id);
    // bake_cookie(cookie_date, date);
    // bake_cookie(cookie_view, view);

    // //----------------------------





    //  console.log(e.event.setProp("title", "<em>oi<em>"));

    //console.log(e.event.setProp("classNames", "<i class=fa fa-undo></i>"));

    // console.log(e.event.setProp(e.el.innerHTML, <i className='fa fa-undo'></i>));

    // console.log(e.event.setProp(e.el.innerHTML));

    // console.log(this.state.calendarApi);

    // console.log(e.event.setProp("title", parse.transform(<i class='fa fa-undo'></i>)));


    // const history = this.props.history;
    // history.push({ pathname: `/occultation_detail/${id}` });

  };















  //Control when change the header buttons(day, week, month, year. prev,next).
  handleDateRender = (arg) => {

    let start_date = arg.view.currentStart;
    let end_date = arg.view.currentEnd;



    if (this.state.calendarApi !== null) {
      // console.log(this.state.calendarApi.view);

      this.reloadCalender(start_date, end_date);

    }


  }



  //It controls when event is being rendering 
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

    // console.log(event);

    // console.log(event.event.setProp(event.el.innerText, "<em>oi<em>"));

    //console.log(event.el.innerHTML);
    // event.event.setProp(event.event.title, "opa");

  };




  render() {
    const { defaultDate, defaultView, predictionEvents, } = this.state;

    console.log(defaultDate);



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
            defaultDate={defaultDate}
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