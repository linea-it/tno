import React, { useEffect, useState, useLayoutEffect } from 'react';
import { withRouter } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import DayGridPlugin from '@fullcalendar/daygrid';
import InteractionPlugin from '@fullcalendar/interaction';
import ListPlugin from '@fullcalendar/list';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/list/main.css';
import occultationData from '../assets/occultation_calendar_data';
import { makeStyles } from '@material-ui/core/styles';
import { getOccultations, getCalendarEvents } from '../api/Prediction';
// import '../assets/css/occultationCalendar.css';
import moment from 'moment';




const useStyles = makeStyles(theme => ({

  icon: {

  },
}));



function OccultationCalendar({ history, setTitle, match: { params } }) {


  const classes = useStyles();
  const [events, setEvents] = useState([]);
  // const [initialDate, setInitialDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  // const [finalDate, setFinalDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  const [initialDate, setInitialDate] = useState(moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [finalDate, setFinalDate] = useState(moment(new Date()).endOf('month').format('YYYY-MM-DD'));
  const [paramsInitialDate, setParamsInitialDate] = useState(null);
  const [paramsFinalDate, setParamsFinalDate] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);



  const loadData = () => {

    setLoadingCalendar(true);
    getCalendarEvents({ initialDate, finalDate }).then((res) => {



      let data = res.data.results;
      let result = [];

      data.map((resp, idx) => {

        result.push({ id: resp.id, title: resp.asteroid_name, date: resp.date_time, textColor: "white" });
      });

      setEvents(result);

      console.log(result);


    });



    // getOccultations({ id: 10 }).then((res) => {
    //   console.log(res);
    // });


    // let arrayEvents = [];
    // let result = [];

    // let keys = Object.keys(occultationData);

    // keys.forEach(function (key) {
    //   result.push(occultationData[key]);
    // });

    // result[3].map((res, idx) => {
    //   arrayEvents.push({ id: res.id, title: res.asteroid_name, date: res.date_time, textColor: 'white' });
    // });

    // setEvents(arrayEvents);
    // console.log(arrayEvents);


  };


  useEffect(() => {

    setTitle("Occultation Calendar");

    loadData();


  }, [initialDate, finalDate]);



  // useEffect(() => {



  //   setParamsInitialDate(null);
  //   setParamsFinalDate(null);


  // }, [paramsInitialDate, paramsFinalDate]);




  // const events =
  //   [
  //     { title: "2004 DA62 ", date: '2019-08-10 11:32:00', textColor: 'white', },
  //     { title: "oi", date: '2019-08-12 17:30:00', textColor: 'white', backgroundColor: "green", icon: "asterisk" },
  //     { title: "Event Test", date: '2019-09-16 17:30:00', textColor: 'white', backgroundColor: "green", icon: "asterisk" },
  //   ]

  const header = {
    center: 'title',
    right: 'prev,next, ',
    month: 'month',
    listYear: 'Year',
    left: 'dayGridDay,dayGridWeek,dayGridMonth,listYear',

  }


  const handleDateRender = (arg) => {
    let start_date = moment(arg.view.currentStart).format("YYYY-MM-DD");
    let end_date = moment(arg.view.currentEnd).subtract(1, 'days').format("YYYY-MM-DD");


    // console.log(arg);
    // console.log(start_date);

    // console.log(start_date, end_date);

    if (params.sDate) {
      setParamsInitialDate(params.sDate);
      setParamsFinalDate(params.fDate);
      console.log("Params");

    } else {

      console.log("Not Params");
      setInitialDate(start_date);
      setFinalDate(end_date);

    }

  }



  //Variable used to change specific button name
  const buttonText = {
    listYear: 'year',
    month: 'month',

  }




  const handleEvent = (e) => {
    let id = e.event.id;
    let date = e.event.start;
    let view = e.view.type;
    let flag = "calendar";
    let sDate = { initialDate };
    let fDate = { finalDate }

    history.push(`/test-calendar/${id}/${date}/${view}/${flag}/${sDate}/${fDate}`);


  };



  const handleEventRender = (event) => {

    event.el.innerHTML = event.el.innerHTML + "<i id='sol_lua' class='far fa-moon'></i>";

  };



  return (

    <div>
      <FullCalendar
        header={header}
        events={events}
        loading={loadingCalendar}

        //params.date is coming back from occulation. 
        //It's being used to maintain data that went from calendar to occultation.
        //Flow:
        // 1 -User chooses an event. 
        // 2- The specific data goes to occultation.
        // 3 - On occultation screen user click on back button.
        // 4 - When back, data comes inside params props.(params are internal(invisible operation));   
        defaultDate={params.date ? new Date(params.date) : new Date()}

        eventClick={handleEvent}
        buttonText={buttonText}
        plugins={[DayGridPlugin, InteractionPlugin, ListPlugin]}
        defaultView={params.view ? params.view : null}
        themeSystem={"standard"}
        datesRender={handleDateRender}
        weekNumbers={true}
        eventRender={handleEventRender}


      />
    </div>

  );

}


export default withRouter(OccultationCalendar);
