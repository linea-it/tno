import React,  { Component } from "react";
import { AlertList, Alert } from "react-bs-notifier";
import { Button } from 'primereact/button';

export default class Growl extends Component {

    state = {
        check: null,
    }
    showSucess = () =>  {
        if (!this.state.check) {
            return (
                <Alert type="danger" headline="Error!">
                     Holy cow, man!
                </Alert>
            );
        }
        
    }
    render() {
        return(
            <div>
                <Button
                    label="success"
                    className="p-button-success" 
                    onClick={this.showSucess()}
                />
            </div>
        );
    }
}