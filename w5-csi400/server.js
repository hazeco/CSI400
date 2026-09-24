const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// listen domain permission
const allowedDomains = [
    `http://localhost:5500`,
    `http://api.bankwisea.com`,
    `https://api.bankwiseb.com`
];

// CORS Options
const corsOptions = {
    origin: function (origin, callback){
        if (!origin) {
            return callback(new Error('Origin is missing'), false);
        }
        if (allowedDomains.includes(origin)) {
            callback(null, true);// allow
        } else {
            callback(new Error('Not allowed by CORS')); //block
        }
    },
    method:['GET', 'POST'],
    credential: true, //Supported cookie or token
    allowedHeader: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

//Private API
app.get('/api/private-data', (req, res) => {
    res.json({
        message: 'Private API Access Granted',
        data: ['secret1', 'secret2', 'secret3']
    });
});
//Handle error CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({ error: 'Access denied: CORS policy does not allow this origin' });
    } else {
        next(err)
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'Hello Ngro' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

