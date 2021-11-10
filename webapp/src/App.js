import './App.scss';
import React from 'react';
import Home from "./components/Home";
import ModerationRoom from "./components/ModerationRoom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink,
} from "react-router-dom";
import EstimationRoom from "./components/EstimationRoom";
import io from "socket.io-client";


let API_URL = '';
if (process.env.NODE_ENV === 'development') {
    API_URL = 'http://9.198.88.223:3000';
}
let SOCKET_URL = '';
if (process.env.NODE_ENV === 'development') {
    SOCKET_URL = 'http://9.198.88.223:3030';
}


export {API_URL};
export {SOCKET_URL};

let APP_SOCKET = io.connect(SOCKET_URL + '/sockets');
export {APP_SOCKET};

function App() {
    return (
        <Router>
            <nav>
                <ul>
                    <li>
                        <NavLink exact to="/" activeClassName="active">Home</NavLink>
                    </li>
                </ul>
            </nav>
            <div className="appContent">
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/moderation-room" component={ModerationRoom}/>
                    <Route path="/estimation-room" component={EstimationRoom}/>
                </Switch>
            </div>
        </Router>
    );
}

export class FetchUtils {

    fetch(api, request, successCallback) {
        return fetch(api, request)
            .then(this.mapJsonResponse)
            .then(successCallback)
            .catch((err) => {
                console.log(err);
            });
    }

    mapJsonResponse(response) {
        let json = response.json();
        if (response.status >= 400 && response.status < 600) {
            throw new Error(`Bad response from server, status: ${response.status}, error: ${json.error}`);
        }
        return json;
    }
}


export default App;
