const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const express = require('express');
const app = express();

require('dotenv').config();
var path = require('path');

const https = require('https');
const fs = require('fs');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER,
};

app.use(auth(config));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


const PORT = process.env.PORT;

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});


app.use(express.json())
app.use(express.urlencoded({extended: true}))

const turnRoute = require('./routes/turn')
app.use('/turn', turnRoute)

const userRoute = require('./routes/user')
app.use('/user', userRoute)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));

// index 
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/solo', function(req, res) {
  res.render('solo', {mode : process.env.MODE});
});

app.get('/two-player', function(req, res) {
  res.render('two-player', {
    mode : process.env.MODE, 
    port : process.env.PORT,
    isAuthenticated: req.oidc.isAuthenticated(), 
    user: JSON.stringify(req.oidc.user),
  });
});

app.get('/computer', function(req, res) {
  res.render('computer', {mode : process.env.MODE});
});

app.get('/custom-login', function(req, res) {
  res.oidc.login({
    returnTo: '/two-player',
  })
});

let options;

const environment = process.env.NODE_ENV || 'testing';

if (environment === 'production'){
  options = {
    key: fs.readFileSync('/etc/letsencrypt/live/hexgame0.com/privkey.pem', 'utf-8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/hexgame0.com/fullchain.pem', 'utf-8'),
  };
}
else{
  options = {
    key: fs.readFileSync('key.pem', 'utf-8'),
    cert: fs.readFileSync('cert.pem', 'utf-8'),
    passphrase: process.env.SMALLSECRET,
  };
}

const httpsServer = https.createServer(options, app);

const socketio = require("./socketio.js");
const io = socketio.getio(httpsServer);

httpsServer.listen(PORT, ()=>{
  console.log("Server running on PORT " + PORT)
});
