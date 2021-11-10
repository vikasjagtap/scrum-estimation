import React from "react";
import io from "socket.io-client";
import {SOCKET_URL} from "../App";
import SessionUpdate from "./SessionUpdate";
import {Redirect} from "react-router-dom";
import Loader from "react-loader-spinner";
import VoteEstimation from "./VoteEstimation";

export default class EstimationRoom extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.location.state;

        this.handleSessionChange = this.handleSessionChange.bind(this);
        this.handleJoinSession = this.handleJoinSession.bind(this);
    }

    handleSessionChange(err, session) {
        if (!this._mounted) {
            return;
        }
        console.log(session);
        this.setState({
            session: session,
            inProgressEstimation: session.inProgressEstimation
        });
    }

    handleJoinSession(err, data) {
        if (!this._mounted) {
            return;
        }

        if (data.estimator.name && data.session) {
            this.setState({
                estimator: data.estimator,
                session: data.session,
                inProgressEstimation: data.session.inProgressEstimation,
                sessionNotFound: false
            });
        } else {
            this.setState({
               sessionNotFound: true
            });
        }
    }

    componentDidMount() {
        this._mounted = true;
        this.props.history.replace();
        if (this.state && this.state.sessionId) {
            this.socket = io(`${SOCKET_URL}/sockets/session/${this.state.sessionId}`);
        }
        if (this.socket) {
            this.socket.emit('estimatorConnect', {name: this.state.name, session:{id: this.state.sessionId}}, this.handleJoinSession)
            this.socket.on("sessionUpdated", this.handleSessionChange);

            this.setState({socket : this.socket, socketNotCreated: false});
        } else {
            this.setState({
                socketNotCreated: true
            });
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.socket) {
            this.socket.emit('estimatorDisconnect', {name: this.state.name})
        }
    }

    render() {
        if (!this.state || !this.state.sessionId) {
            console.log("home redirect");
            return (<Redirect to={"/"}/>);
        }

        return (
            <div className={"session"}>
                {
                    !this.state.session ?
                        (<Loader className="sessionLoading light" type="ThreeDots" color="#2BAD60" height="75" width="75"/>) :
                        (
                            <div className={"content"}>
                                <div className={"sessionContent"}>
                                    <VoteEstimation name={this.state.name} sessionSocket={this.state.socket} estimation={this.state.inProgressEstimation}/>
                                </div>
                                <SessionUpdate sessionSocket={this.state.socket} name={this.state.name}/>
                            </div>
                        )
                }
            </div>);


    }

}