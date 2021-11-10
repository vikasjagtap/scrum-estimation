var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var uuid = require('node-uuid');
var _ = require('lodash');
const http = require("http");
const socketIo = require("socket.io");
var app = express();


if (process.env.NODE_ENV === 'development') {
    var cors = require('cors');

    const whitelist = ['http://localhost:3001'];
    const corsOptions = {
        credentials: true, // This is important.
        origin: (origin, callback) => {
            // if(whitelist.includes(origin))
                return callback(null, true)

            // callback(new Error('Not allowed by CORS'));
        }
    }

    app.use(cors(corsOptions));

}

const server = http.createServer(app);
server.listen(3030);
const io = socketIo(server);

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var sessionRouter = require('./routes/session');
app.use('/', indexRouter);
app.use('/session', sessionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


var sessions = [];

var generateSession = function (moderator) {

    var session = _.find(sessions, {moderator : {name : moderator.name}});

    if (session) {
        return session;
    }

    session = {};
    session.id = uuid.v4();
    session.estimators = [];
    session.estimations = [];
    session.updates = [];
    session.moderator = moderator;

    sessions.push(session);

    return session;
};
const EstimationStatus = {
    NOT_STARTED: 1,
    STARTED: 2,
    FINISHED: 3
}

Object.freeze(EstimationStatus);
function createSession(data) {
    const session = generateSession({name: data.name});
    let sessionNamespace = `/sockets/session/${session.id}`;

    if (io.nsps.hasOwnProperty(sessionNamespace)) {
        return session;
    }

    session.updates.push({message: `Session created by: ${data.name}`, type: 'sessionConnection' })

    let sessionClients = io.of(sessionNamespace)
        .on('connection', function (socket) {
            let paths = socket.nsp.name.split("/");
            const sessionId = paths[paths.length -1];
            const session = _.find(sessions, {id: sessionId});

            console.log("New session client connected", sessionId);

            socket.on('getSession', function (data, cb) {
                cb.call(null, null, session);
            });

            socket.on('startEstimation', function (data, cb) {
                if (session) {
                    let estimation = _.find(session.estimations, {ticketNumber: data.estimation.ticketNumber});
                    if (!estimation) {
                        session.estimations.push(data.estimation);
                        estimation = data.estimation;
                        estimation.status = EstimationStatus.NOT_STARTED;
                        estimation.votes = [];
                    }
                    if (!session.inProgressEstimation &&
                        !estimation.status !== EstimationStatus.STARTED) {
                        estimation.status = EstimationStatus.STARTED;
                        session.inProgressEstimation = estimation;
                        session.updates.push({message: `Estimation started: ${data.estimation.ticketNumber}`, type: 'sessionConnection'})
                        cb.call(null, null, {estimation: estimation});
                    }
                    sessionClients.emit("sessionUpdated", null, session);
                }
            });

            socket.on('voteEstimation', function (data, cb) {
                if (session) {
                    let estimation = _.find(session.estimations, {ticketNumber: data.estimation.ticketNumber});
                    let estimator = _.find(session.estimators, {name: data.estimator.name});
                    if (estimation &&
                        session.inProgressEstimation &&
                        session.inProgressEstimation.ticketNumber === estimation.ticketNumber &&
                        estimator) {
                        let vote = _.find(estimation.votes, {name: estimator.name});
                        if (!vote) {
                            estimation.votes.push({
                                name: estimator.name,
                                value: data.voteValue
                            })
                            session.updates.push({message: `Estimation ${estimation.ticketNumber}: ${estimator.name} voted`, type: 'sessionConnection'})
                        } else {
                            vote.value = data.voteValue;
                            session.updates.push({message: `Estimation ${estimation.ticketNumber}: ${estimator.name} changed vote`, type: 'sessionConnection'})
                        }
                        cb.call(null, null, {estimation: estimation});
                        sessionClients.emit("sessionUpdated", null, session);
                    }
                }
            });

            socket.on('estimatorConnect', function (data, cb) {
                if (session) {
                    let estimator = _.find(session.estimators, {name: data.name});
                    if (!estimator) {
                        estimator = {
                            name: data.name,
                        }
                        session.estimators.push(estimator);
                    }
                    if (!estimator.online) {
                        estimator.online = true;
                        session.updates.push({message: `Session joined by estimator: ${data.name}`, type: 'sessionConnection'})
                        cb.call(null, null, {estimator: estimator, session: session});
                        sessionClients.emit("sessionUpdated", null, session);
                    }
                }
            });

            socket.on('moderatorConnect', function (data, cb) {
                if (session && session.moderator.name === data.name) {
                    session.moderator.online = true;
                    session.updates.push({message: `Session joined by moderator: ${data.name}`, type: 'sessionConnection' })
                    sessionClients.emit("sessionUpdated", null, session);
                    cb.call(null, null, {session: session});
                }
            });

            socket.on('estimatorDisconnect', function (data, cb) {
                if (session) {
                    let estimator = _.find(session.estimators, {name: data.name});
                    if (estimator) {
                        estimator.online = false;
                        session.updates.push({message: `Session left by estimator: ${data.name}`, type: 'sessionConnection' })
                    }
                    sessionClients.emit("sessionUpdated", null, session);
                }
            });

            socket.on('moderatorDisconnect', function (data, cb) {
                if (session) {
                    session.moderator.online = false;
                    session.updates.push({message: `Session left by moderator: ${session.moderator.name}`, type: 'sessionConnection' })
                    sessionClients.emit("sessionUpdated", null, session);
                }
            });


            socket.on('message', function (data, cb) {
                const session = _.find(sessions, {id : data.session.id});
                if (session) {
                    session.updates.push({message: data.message, type: 'message', sender: data.name });
                    sessionClients.emit("sessionUpdated", null, session);
                }
            });
        });

    return session;
}

let clients = io.of('/sockets').on('connection', function (socket) {
    console.log("New client connected", socket.id);
    socket.on("disconnect", (reason) => {
        console.log("Client disconnected: ", reason);
    });
    socket.on("getSessions", (data, cb) => {
        cb.call(null, null, sessions);
    });
    socket.on("createSession", (data, cb) => {
        var session = createSession(data);
        clients.emit('sessionsUpdated', null, sessions);
        cb.call(null, null, session);
    });
});

module.exports = app;
module.exports.socketIo = io;
