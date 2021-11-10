import React from "react";
import Modal from "react-modal";
import "./Modal.scss"
import "./CreateEstimationButton.scss"

import _ from 'lodash';


export default class CreateEstimationButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {showModal: false};

        this.handleTicketNumberChange = this.handleTicketNumberChange.bind(this);
        this.handleTicketTitleChange = this.handleTicketTitleChange.bind(this);
        this.handleTicketDescriptionChange = this.handleTicketDescriptionChange.bind(this);
        this.handleTicketUrlChange = this.handleTicketUrlChange.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleOpenModal () {
        this.setState({ showModal: true });
    }

    handleCloseModal () {
        this.setState({ showModal: false });
    }

    handleTicketNumberChange(event) {
        const state = {ticketNumber: event.target.value}
        this.setFromState(state);
    }

    handleTicketTitleChange(event) {
        const state = {ticketTitle: event.target.value}
        this.setFromState(state);
    }

    handleTicketDescriptionChange(event) {
        const state = {ticketDescription: event.target.value}
        this.setFromState(state);
    }

    handleTicketUrlChange(event) {
        const state = {ticketUrl: event.target.value}
        this.setFromState(state);
    }


    createEstimation() {
        if (!this.state.formValid) {
            return;
        }

        this.props.onEstimationCreated({
            ticketNumber: this.state.ticketNumber,
            ticketTitle: this.state.ticketTitle,
            ticketDescription: this.state.ticketDescription,
            ticketUrl: this.state.ticketUrl
        });
        this.handleCloseModal();
    }

    setFromState(state) {
        const newState = _.extend({}, this.state, state);
        newState.formValid =  newState.ticketNumber && newState.ticketTitle && newState.ticketDescription && newState.ticketUrl;
        this.setState(newState);
    }



    render() {
        return <div className={`createEstimationButton ${this.props.className}`}>
            <button disabled={this.props.disabled} onClick={this.handleOpenModal}>New Estimation</button>
            <Modal
                isOpen={this.state.showModal}
                className="Modal"
                overlayClassName="Overlay"
                contentLabel="Create VoteEstimation"
            >
                <label className="ticketNumber">
                    Ticket Number:
                    <input type="text" name="ticketNumber" placeholder="Enter ticket number" onChange={this.handleTicketNumberChange}/>
                </label>
                <label className="ticketTitle">
                    Title:
                    <input type="text" name="ticketTitle" placeholder="Enter ticket title" onChange={this.handleTicketTitleChange}/>
                </label>
                <label className="ticketUrl">
                    URL:
                    <input type="text" name="ticketUrl" placeholder="Enter ticket URL" onChange={this.handleTicketUrlChange}/>
                </label>
                <label className="ticketDescription">
                    Description:
                    <textarea name="ticketDescription" rows="4" placeholder="Enter ticket number" onChange={this.handleTicketDescriptionChange}/>
                </label>
                <div className={"footer"}>
                    <button type="button" disabled={!this.state.formValid} onClick={() => this.createEstimation()}>Create VoteEstimation</button>
                    <button className={"secondary"} type="button" onClick={() => this.handleCloseModal()}>Close</button>
                </div>

            </Modal>
        </div>
    }

}