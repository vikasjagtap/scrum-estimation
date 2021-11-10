const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "estimation.db"

const database = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {

        database.serialize(function () {

            console.log('Connected to the SQLite database.')
            // db.run(`DROP TABLE IF EXISTS session`, (err) => {
            //     if (err) {
            //         console.log('Error', err)
            //     }});

            // db.run(`DROP TABLE IF EXISTS estimator`, (err) => {
            //     if (err) {
            //         console.log('Error', err)
            //     }});

            database.run(`CREATE TABLE IF NOT EXISTS session
                    (
                        session_id
                        INTEGER
                        PRIMARY
                        KEY
                        AUTOINCREMENT,
                        created_by
                        text
                        not
                        null,
                        status
                        INTEGER
                        not
                        null
                    )`,
                (err) => {
                    if (err) {
                        console.log('Error creating table session', err)
                    }
                });

            database.run(`CREATE TABLE IF NOT EXISTS estimator
                    (
                        estimator_id
                        INTEGER
                        primary
                        key
                        AUTOINCREMENT,
                        session_id
                        INTEGER
                        not
                        null,
                        name
                        text
                        not
                        null,
                        observer
                        tinyint
                        NOT
                        NULL
                        DEFAULT
                        0
                        CHECK (
                        observer
                        IN
                    (
                        0,
                        1
                    )),
                        unique
                    (
                        session_id,
                        name
                    ),
                        FOREIGN KEY
                    (
                        session_id
                    )
                        REFERENCES session
                    (
                        session_id
                    )
                        )`,
                (err) => {
                    if (err) {
                        console.log('Error creating table estimator', err)
                    }
                });
        });
    }
});

function dbSelectOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
}

function dbSelectAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        database.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            resolve({
                id: this.lastID
            });
        });
    });
}


module.exports.dbSelectOne = dbSelectOne;
module.exports.dbSelectAll = dbSelectAll;
module.exports.dbRun = dbRun;
module.exports.database = database;