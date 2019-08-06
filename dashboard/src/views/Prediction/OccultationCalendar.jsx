import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
// import { Calendar } from '@fullcalendar/core';
// import { FullCalendar } from 'primereact/fullcalendar';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


class OccultationCalendar extends Component {

    state = {
        events: [
            {
                id: 1,
                title: 'All Day Event',
                start: '2017-02-01'
            },
            {
                id: 2,
                title: 'Long Event',
                start: '2017-02-07',
                end: '2017-02-10'
            },
            {
                id: 3,
                title: 'Repeating Event',
                start: '2017-02-09T16:00:00'
            },
        ],
        options: {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            defaultView: 'dayGridMonth',
            defaultDate: '2017-02-01',
            header: {
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth, timeGridWeek, timeGridDay'
            },
            editable: true
        }
    };




    componentDidMount() {

    }

    create_nav_bar = () => {
        return (
            <Toolbar>
                <div className="ui-toolbar">
                    <Button
                        label="Back"
                        icon='fa fa-undo'
                        onClick={() => this.onClickBackToRunDetails()}
                    />
                </div>
            </Toolbar>
        );
    };

    onClickBackToRunDetails = () => {
        const history = this.props.history;
        history.goBack();
    }
    render() {

        return (
            <div>
                {this.create_nav_bar()}

                {/* <Calendar
                    events={this.state.events}
                    options={this.state.options}

                /> */}

            </div>

        );
    }
}


export default withRouter(OccultationCalendar);