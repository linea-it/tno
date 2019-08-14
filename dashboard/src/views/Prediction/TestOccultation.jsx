import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'primereact/button';


class TestOccultation extends Component {

    state = {
        id: null,
        defaultDate: null,
        flag: null,
    };

    componentWillMount() {

        const { match: { params } } = this.props;

        this.setState({
            id: params.id,
            defaultDate: params.defaultDate,
            flag: params.flag,

        });

    };



    backToOccutationCalendar = () => {
        //The system receive a flag contaning the information
        //about who called that page.
        //Check: if has flag: calendar then came from occultation calendar. Back it up
        //ELSE: came from occultations. Back it up


        if (this.state.flag === "calendar") {


            let id = this.state.id;
            let defaultDate = this.state.defaultDate;

            const history = this.props.history;
            history.push(`/prediction_calendar_back/${id}/${defaultDate}`)
        }
        else {
            console.log("Back to occultations");
        }



    }


    render() {
        return (


            <div>
                <h3>Test TestOccultation</h3>
                <Button
                    label="Back"
                    icon="fa fa-undo"
                    onClick={() => this.backToOccutationCalendar()}

                />
                <h5>id: {this.state.id}</h5>
                <h5>flag: {this.state.flag}</h5>
                <h5>default Date: &nbsp; {this.state.defaultDate}</h5>

            </div>
        );
    }
}

export default withRouter(TestOccultation);