import React from "react";
import {Redirect} from "react-router-dom";
import io from "socket.io-client";
import {SOCKET_URL} from "../App";
import SessionUpdate from "./SessionUpdate";
import "./Session.scss";
import Loader from "react-loader-spinner";
import CreateEstimationButton from "./CreateEstimationButton";
import ModerateEstimation from "./ModerateEstimation";

export default class ModerationRoom extends React.Component {

    constructor(props) {
        super(props);
        this.state = this.props.location.state;

        this.onEstimationCreated = this.onEstimationCreated.bind(this);
        this.onFinishVoting = this.onFinishVoting.bind(this);
        this.handleStartEstimation = this.handleStartEstimation.bind(this);

        this.handleSessionChange = this.handleSessionChange.bind(this);
        this.handleJoinSession = this.handleJoinSession.bind(this);
    }


    onEstimationCreated(estimation) {
        if (this.socket) {
            this.socket.emit('startEstimation', {estimation}, this.handleStartEstimation)
        }
        this.handleCloseModal();
    }

    onFinishVoting() {
        if (!this.state.inProgressEstimation) {
            return;
        }

        if (this.socket) {
            this.socket.emit('finishEstimation', {estimation: this.state.inProgressEstimation}, this.handleStartEstimation)
        }
    }

    handleCloseModal () {
        this.setState({ showModal: false });
    }

    handleStartEstimation(err, estimation) {

    }

    handleSessionChange(err, session) {
        if (!this._mounted) {
            return;
        }
        this.setState({
            session: session,
            inProgressEstimation: session.inProgressEstimation,
            estimators: session.estimators,
            votes: session.votes
        });
    }

    handleJoinSession(err, data) {
        if (!this._mounted) {
            return;
        }
        if (data.session) {
            this.setState({
                sessionNotFound: false,
                session: data.session,
                inProgressEstimation: data.session.inProgressEstimation,
                estimators: data.session.estimators,
                votes: data.session.votes
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
            this.socket.emit('moderatorConnect', {name: this.state.name, session:{id: this.state.sessionId}}, this.handleJoinSession);
            this.socket.on("sessionUpdated", this.handleSessionChange);
            this.setState({socket : this.socket});
        } else {
            this.setState({
                socketNotCreated: true
            });
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        if (this.socket) {
            this.socket.emit('moderatorDisconnect')
        }
    }

    render() {
        if (!this.state || !this.state.sessionId) {
            return (<Redirect to={"/"}/>);
        }

        return (
            <div className={"session"}>
                {
                    !this.state.session ?
                        (<Loader className="sessionLoading light" type="ThreeDots" color="#2BAD60" height="75" width="75"/>) :
                        (<div className={"content"}>
                            {
                                <div className={"sessionContent"}>
                                    <div className={"toolbar"}>
                                        <CreateEstimationButton className={"toolbarButton"} session="{this.state.session}" isOpen={this.state.showModal} onEstimationCreated={this.onEstimationCreated}/>
                                    </div>
                                    <ModerateEstimation estimation={this.state.inProgressEstimation} estimators={this.state.estimators} onFinishVoting={() => this.onFinishVoting()}/>
                                </div>
                            }

                            <SessionUpdate sessionSocket={this.state.socket} name={this.state.session.moderator.name}/>
                        </div>)
                }
            </div>);
    }


};