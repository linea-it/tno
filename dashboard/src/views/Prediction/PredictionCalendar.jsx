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


    state = {
        defaultDate: new Date(),
        defaultView: 'dayGridMonth',
        predictionEvents: null,
        log_visible: false,
        calendar_content: null,
    }

    handleDateClick = (e) => {
        console.log(e);

    };

    handleEvent = (e) => {
        let id = e.event.id;

        const history = this.props.history;
        history.push({ pathname: `/occultation_detail/${id}` });

    };

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


    render() {
        const { defaultDate, defaultView, predictionEvents, } = this.state;

        // const events =
        //     [
        //         { title: "2004 DA62", date: '2019-08-10 11:32:00', textColor: 'white' },
        //         { title: 'Evento2', date: '2019-08-12 17:30:00', textColor: 'white' },
        //     ]


        const header = {
            center: 'title',
            right: 'prev,next',
            month: 'month',
            listYear: 'Year',
            left: 'dayGridDay,dayGridWeek,dayGridMonth,listYear',

        }

        const buttonText = {
            listYear: 'year',
            listMonth: 'list month',
            month: 'month'

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
                        eventClick={this.handleEvent}
                        defaultView={defaultView}
                        plugins={[bootstrapPlugin, dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                        dateClick={this.handleDateClick}
                        weekNumbers={true}
                    />

                </Card>


            </div >
        );
    }

}