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
import CircularProgress from '@material-ui/core/CircularProgress';
import AppBar from './AppBarCalendario';




const useStyles = makeStyles(theme => ({

  loading: {
    position: 'fixed',
    top: 200,
    bottom: 0,
    left: 700,
    right: 0,
    zIndex: 100,
  },
}));




function OccultationCalendar({ history, setTitle, match: { params } }) {



  const [events, setEvents] = useState([]);
  // const [initialDate, setInitialDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  // const [finalDate, setFinalDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
  const [initialDate, setInitialDate] = useState(params.sDate ? params.sDate : moment(new Date()).startOf('month').format('YYYY-MM-DD'));
  const [finalDate, setFinalDate] = useState(moment(new Date()).endOf('month').format('YYYY-MM-DD'));
  const [paramsInitialDate, setParamsInitialDate] = useState(null);
  const [paramsFinalDate, setParamsFinalDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventColorBlue, setEventColorBlue] = useState();
  const [eventColor, setEventColor] = useState();



  const classes = useStyles();



  const search = null;


  const loadData = () => {



    setLoading(true);

    getCalendarEvents({ initialDate, finalDate }).then((res) => {



      let data = res.data.results;
      let result = [];


      data.map((resp, idx) => {
        console.log();
        result.push({
          id: resp.id,
          title: resp.asteroid_name,
          date: resp.date_time,
          textColor: "white",
          backgroundColor: resp.asteroid_name.includes(search) || ((resp.asteroid_name).toLowerCase()).includes(search) ? 'green' : ''
        });

      });

      setEvents(result);

      setLoading(false);


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


  // const title = "oi";
  // const search = "oi";

  // const events =
  //   [
  //     // { title: "2004 DA62 ", date: '2019-09-10 11:32:00', textColor: 'white', },
  //     { title: "oi", date: '2019-09-12 17:30:00', textColor: 'white', backgroundColor: title === search ? 'green' : 'blue', icon: "asterisk" },
  //     { title: "Event Test", date: '2019-09-16 17:30:00', textColor: 'white', backgroundColor: title === search ? 'green' : 'blue', icon: "asterisk" },
  //   ]

  const header = {
    center: 'title',
    right: 'prev,next, ',
    month: 'month',
    listYear: 'Year',
    left: 'dayGridDay,dayGridWeek,dayGridMonth,listYear',

  }


  const handleDateRender = (arg) => {

    let start_date = null;
    let end_date = null;



    // if (arg.view.type === "listYear") {
    //   setEvents([]);
    // }


    start_date = moment(arg.view.currentStart).format("YYYY-MM-DD");
    end_date = moment(arg.view.currentEnd).format("YYYY-MM-DD");


    // console.log(arg.view.type);


    //     //Houve um problema de visualização quando o usuário clicava na aba day.
    //     //Por isso foi necessário esse if
    //     //O problema foi que como o valor dinâmico do calendário sempre vem um dia a mais,
    //     //tenho preciso tirar um dia(subtract(1,'days')). Porém quando clica na aba day esse gera um pro-
    //     //blema de visualização.
    //     if (arg.view.type === "dayGridDay") {
    //       start_date = moment(arg.view.currentStart).format("YYYY-MM-DD");
    //       end_date = moment(arg.view.currentEnd).format("YYYY-MM-DD");
    //     } else {
    //       start_date = moment(arg.view.currentStart).format("YYYY-MM-DD");
    //       end_date = moment(arg.view.currentEnd).subtract(1, 'days').format("YYYY-MM-DD");
    //     }








    //Um problema que surgiu nesta página foi o seguinte: 
    //Quando o calendário renderiza, ele traz consigo uma data default que é especificada 
    //no atributo no componente. Se o calendário não fosse pra página de ocultações estaria tudo certo.
    //Porém como ele vai pra outra página e retorna trazendo as informações de datas iniciais e finais
    //então foi necessário montar um esquema pra que ele não se perdesse nas renderizações.
    //Desto modo toda vez que ele renderiza, ou ele pega o valor dos params que retornam da página de 
    //ocultações ou ele renderiza um valor default do dia e mês corrente.
    //Já a parte do código abaixo obriga o calendário re-renderizar, quebrando portanto a regra de valor 
    //default. Isso foi extemamente útil pra administrar o conteúdo de forma orgamizada.
    //Ou seja, os valores default são sempre carregados na inicialização.
    //Os valores abaixo definidos são sempre carregados a partir da navegação do usuário.
    //Desta forma consegui amarrar o conteúdo.    


    setInitialDate(start_date);
    setFinalDate(end_date);




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
    let sDate = initialDate;
    let fDate = finalDate;

    history.push(`/test-calendar/${id}/${date}/${view}/${flag}/${sDate}/${fDate}`);


  };



  const handleEventRender = (event) => {

    // event.el.innerHTML = event.el.innerHTML + "<i id='sol_lua' class='far fa-moon'></i>";

    const time = moment(event.event.start).format('H');

    if (time >= 18) {
      event.el.innerHTML = event.el.innerHTML + "<i id='sol_lua' class='fas fa-moon'></i>";
    } else {
      event.el.innerHTML = event.el.innerHTML + "<i id='sol_lua' class='fas fa-sun'></i>";
    }



    if (event.el.innerText === "5:30p vent Test") {
      setEventColor('green');


    } else {
      setEventColor();
    }


  };





  return (

    <div>



      {loading && <CircularProgress size={100} thickness={0.8} className={classes.loading} color="secundary" ></CircularProgress>}

      <AppBar />
      <FullCalendar
        header={header}
        events={events}


        //params.date is coming back from occulation. 
        //It's being used to maintain data that went from calendar to occultation.
        //Flow:
        // 1 -User chooses an event. 
        // 2- The specific data goes to occultation.
        // 3 - On occultation screen user click on back button.
        // 4 - When back, data comes inside params props.(params are internal(invisible operation));   
        defaultDate={params.sDate ? params.sDate : initialDate}


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
