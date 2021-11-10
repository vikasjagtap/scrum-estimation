import React from "react";
import {Redirect} from "react-router-dom";
import "./SessionUpdate.scss";
import Loader from 'react-loader-spinner';

export default class SessionUpdate extends React.Component{

    constructor(props) {
        super(props);

        const state = {
            message: '',
            onlineEstimators: []
        }
        if (this.props.session && this.props.session.id) {
            state.session = this.props.session;
        }

        if (this.props.name) {
            state.name = this.props.name;
        }

        if (this.props.sessionSocket) {
            state.socket = this.props.sessionSocket;
        }

        this.state = state;

        this.handleSessionChange = this.handleSessionChange.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.onSendMessage = this.onSendMessage.bind(this);
    }

    handleMessageChange(event) {
        if (!this._mounted) {
            return;
        }
        const state = {message: event.target.value}
        state.validMessage = event.target.value;
        this.setState(state);
    }

    handleSessionChange(err, session) {
        if (!this._mounted) {
            return;
        }
        if (!session) {
            this.setState({
                sessionNotFound: true
            });
            return;
        }
        const onlineEstimators = session.estimators.filter((estimator) => estimator.online);

        this.setState({
            sessionNotFound: false,
            session: session,
            onlineEstimators: onlineEstimators
        });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidMount() {
        this._mounted = true;
        if (this.state.socket) {
            this.state.socket.on("sessionUpdated", this.handleSessionChange);
            this.state.socket.emit("getSession", {}, this.handleSessionChange);

        }
    }

    render() {

        if (this.state.sessionNotFound) {
            return <div className="sessionUpdate">
                <span>Session not found</span>
            </div>
        }

        if (!this.state.session) {
            return <div className="sessionUpdate">
                <Loader className="sessionLoading dark" type="ThreeDots" color="#2BAD60" height="75" width="75" />
            </div>
        }

        return (
            <div className="sessionUpdate">
                <div className={"header"}>
                    <div className={"sessionDetails"}>Session ID: {this.state.session.id}</div>
                    <div className={"personDetails"}>{this.state.name}</div>
                </div>
                <div className={"estimators"}>
                    <div className={"estimatorHeader"}>
                        Estimators ({this.state.onlineEstimators.length})
                    </div>
                    {
                        this.state.onlineEstimators.map((estimator, key) => {
                            return (
                                <div className={"estimator"} key={key}>
                                    {estimator.name === this.state.name ? `${estimator.name} (you)` : estimator.name}
                                </div>)
                        })
                    }
                </div>
                <div className={"updates"}>
                    {
                        this.state.session.updates.map((update, key) => {
                            return (
                                <div className={this.getClassNames(update)} key={key}>
                                    <div className={"sender"}>
                                        {update.sender === this.state.name ? 'you' : update.sender}:
                                    </div>
                                    <div className={"triangle"}></div>
                                    <div className={"messageContent"}>
                                        {update.message}
                                    </div>
                                </div>)
                        })
                    }
                </div>
                <form onSubmit={this.onSendMessage} className="footer">
                    <input type="text" value={this.state.message} placeholder="Type a message..." onChange={this.handleMessageChange}/>
                    <button type={"submit"}>Send</button>
                </form>
            </div>
        )
    }


    getClassNames(update) {
        let classNames = update.type;

        if (update.sender) {
            if (update.sender === this.state.name) {
                classNames += ` outgoing`;
            } else {
                classNames += ` incoming`;
            }
        }

        return classNames;
    }

    onSendMessage(event) {
        event.preventDefault();

        if (!this.state.validMessage) {
            return;
        }

        this.state.sessionSocket.emit("message", {name: this.state.name, message: this.state.message, session: this.state.session});
        this.setState({
            message: ''
        })
    }
}