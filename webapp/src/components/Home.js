import React from "react";
import {Redirect} from "react-router-dom";
import "./Home.scss"
import {APP_SOCKET} from "../App";

class Home extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            invalidName: true,
            redirectToCreateSession : false,
            sessions: [],
        }
        
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleCreateSession = this.handleCreateSession.bind(this);
        this.handleSessionsChange = this.handleSessionsChange.bind(this);

    }

    handleSessionsChange(err, sessions) {
        if (!this._mounted) {
            return;
        }
        this.setState({
            sessions: sessions
        });
    }


    componentDidMount() {
        this._mounted = true;
        APP_SOCKET.on("sessionsUpdated", this.handleSessionsChange);
        APP_SOCKET.emit("getSessions", {}, this.handleSessionsChange);
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    handleNameChange(event) {
        const state = {name: event.target.value, nameChanged: true}
        state.invalidName = !event.target.value;
        this.setState(state);
    }

    handleCreateSession(err, session) {
        if (session.id) {
            this.setState({
                redirectToModeration: true,
                newSession: session
            });
        }
    }

    createSession() {
        if (this.state.invalidName) {
            console.log("Invalid name provided");
            return;
        }

        APP_SOCKET.emit("createSession", {name: this.state.name}, this.handleCreateSession);
    }

    joinSession() {
        if (this.state.invalidName) {
            console.log("Invalid name provided");
            return;
        }

        if (!this.state.selectedSessionId) {
            console.log("Invalid session id");
            return;
        }

        this.setState({
            redirectToEstimationRoom: true,
        });
    }

    onSessionIdChange(event) {
        this.setState({selectedSessionId: event.target.value});
    }

    render() {

        if (this.state.redirectToModeration) {
            return <Redirect to={{
                pathname: `/moderation-room`,
                state: {
                    name: this.state.name,
                    sessionId: this.state.newSession.id,
                }
            }} />
        }

        if (this.state.redirectToEstimationRoom) {
            return <Redirect to={{
                pathname: `/estimation-room`,
                state: {
                    name: this.state.name,
                    sessionId: this.state.selectedSessionId,
                }
            }} />
        }

        return (
            <div className="home">
                <div className="banner">
                    <h2>Story Points Estimation</h2>
                </div>
                <div className="content">
                    <label className="name">
                        Name:
                        <input type="text" name="name" placeholder="Enter name" onChange={this.handleNameChange}/>
                    </label>
                    <div className="br"></div>
                    <div className="session">
                        <div className="createSession">
                            <button type="button" disabled={this.state.invalidName} onClick={() => this.createSession()}>Create Session</button>
                        </div>
                        {
                            this.state.sessions.length > 0 ?
                                (<div className="joinSession">
                                    <div className="row">
                                        <div className="br"></div>
                                        <div className="or">or</div>
                                        <div className="br"></div>
                                    </div>
                                    <div>
                                        <label>Select Session: </label>
                                        <div className="row">
                                            <select defaultValue={-1} disabled={this.state.invalidName} onChange={(event) => this.onSessionIdChange(event)}>
                                                <option disabled value={-1}>Select Session</option>
                                                {
                                                    this.state.sessions.map((session, key) => {
                                                        return (
                                                            <option key={key} value={session.id}>
                                                                Session {session.id} by {session.moderator.name}
                                                            </option>)
                                                    })
                                                }
                                            </select>
                                            <button type="button" disabled={this.state.invalidName} onClick={() => this.joinSession()}>Join Session</button>
                                        </div>
                                    </div>
                                </div>) : (<div></div>)
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;