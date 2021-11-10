var express = require('express');
var router = express.Router();
var {dbSelectAll, dbSelectOne, dbRun, database} = require("../database.js");
var {socketIo} = require("../app");

const sessionDtoMapper = row => {
    return row ? {id: row.session_id, name: row.created_by} : null;
};

const startSessionNameSpace = (session) => {
    let nsp = socketIo.of(`/session-${session.id}`);
    nsp.on('connection', function(client){
        console.log('someone connected');

    });
    nsp.emit('start', session.name);
}


router.post('/', function(req, res, next) {

    console.log(req.body);
    var errors = []
    if (!req.body.name) {
        errors.push("No name specified");
    }

    if (errors.length) {
        res.status(400).json({"error": errors.join(",")});
        return;
    }

    let sql = "select * session where name = ?";
    dbSelectOne(sql, [req.body.name])
        .then((row) => {
            return sessionDtoMapper(row);
        }, err => handleError(err, res))
        .then((session) => {
            if (session) {
                res.json({
                    "message": "success",
                    "session": session
                });

                startSessionNameSpace(session);

                return;
            }
            var sql = "insert into session(created_by, status) values(? ,?)";
            var params = [req.body.name, 1]
            dbRun(sql, params).then((result) => {
                var session = {
                    id: result.id,
                    name: req.body.name
                };
                res.json({
                    "message": "success",
                    "session":session
                })
            }, err => handleError(err, res));
        });
});


function handleError(err, res) {
    console.log(err.message, err);
    res.status(400).json({"error": err.message});
}

router.post('/estimator', function(req, res, next) {

    console.log(req.body);
    let errors =[]
    if (!req.body.name){
        errors.push("No name specified");
    }

    if (!req.body.sessionId){
        errors.push("No session id specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }

    let sql = "select * from session where session_id = ?"
    let params =[req.body.sessionId];
    let session = null;

    dbSelectOne(sql, params)
        .then((row) => {
            session = sessionDtoMapper(row);
            return session;
        }, err => handleError(err, res))
        .then((session) => {

            function estimatorMapper(id, name, session) {
                return {
                    id: id,
                    name: name,
                    session: session
                }
            }

            if (session === null) {
                res.status(404).json({"error": "Session not found for id specified: " + req.body.sessionId});
                return;
            }

            let sql = "select * from estimator where session_id = ? and name = ?"
            const params = [session.id, req.body.name];

            dbSelectOne(sql, params)
                .then((row) => {
                    if (row) {
                        res.json({
                            "message": "success",
                            "estimator": estimatorMapper(row.estimator_id, row.name, session)
                        });
                        return;
                    }

                    sql = "insert into estimator(session_id, name) values(? ,?)"

                    dbRun(sql, params)
                        .then((result) => {
                            res.json({
                                "message": "success",
                                "estimator": estimatorMapper(result.id, req.body.name, session)
                            });
                        }, err => handleError(err, res));
                }, err => handleError(err, res));
        });
});



module.exports = router;
