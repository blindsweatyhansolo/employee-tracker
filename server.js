const db = require('./db/connection');
const start = require('.');
const PORT = process.env.PORT || 3001;

// Start server after DB connection
db.connect(err => {
    if (err) throw err;
    // run function to start prompts after db connection
    start;
});