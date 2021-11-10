import React from "react";
import "./EstimationDetails.scss"

export default class EstimationDetails extends React.Component {

    constructor(props) {
        super(props);
    }
    render() {

        if (!this.props.estimation) {
            return <div className={"estimationDetails"} />
        }

        return <div className={"estimationDetails"} >
            <div className={"ticketHeader"}>
                <span className={"ticketNumber"}>{this.props.estimation.ticketNumber}:</span>
                <span className={"ticketTitle"}>{this.props.estimation.ticketTitle}</span>
            </div>
            <textarea disabled={true} rows={6} className={"ticketDescription"} value={this.props.estimation.ticketDescription}/>
        </div>
    }

}