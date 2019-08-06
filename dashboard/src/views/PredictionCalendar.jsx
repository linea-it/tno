import React, { Component } from 'react';
import { Card } from 'primereact/card';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css'


export default class PredictionCalendar extends Component {
    render() {
        return (
            <div>
                <Card>
                    <FullCalendar defaultView="dayGridMonth" plugins={[dayGridPlugin]} />
                </Card>
            </div>
        );
    }

}