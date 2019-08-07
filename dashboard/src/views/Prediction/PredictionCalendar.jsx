import React, { Component } from 'react';
import { Card } from 'primereact/card';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from "@fullcalendar/timegrid";
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import "@fullcalendar/timegrid/main.css";
import PredictionApi from './PredictionApi';
import json from '../Prediction/assets/Prediction.json';



export default class PredictionCalendar extends Component {

    api = new PredictionApi();


    state = {
        defaultDate: '2019-08',
    }

    // handleDateClick = (e) => {
    //     console.log(e);

    // };

    componentDidMount() {
        this.fetchData();
    };


    fetchData = () => {
        let result = [];

        let keys = Object.keys(json);

        keys.forEach(function (key) {
            result.push(json[key]);
        });
        result[3].map((res) => {
            console.log(res);
        });



    };



    render() {
        const { defaultDate } = this.state;


        const events = [{
            title: 'Vestibular Estácio', date: '2019-08-10', textColor: 'white',
        }]

        return (
            <div>
                <Card>
                    <FullCalendar
                        defaultDate={this.state.defaultDate}
                        themeSystem={"bootstrap"}
                        events={events}
                        defaultView="dayGridMonth"
                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                        dateClick={this.handleDateClick}
                        editable={true}


                    />
                </Card>
            </div >
        );
    }

}