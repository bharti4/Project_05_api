var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
var mysql = require("mysql")
const dbconfig=require("./DB_Authorization_Model/config.js");
const db = mysql.createConnection(dbconfig.databseTableconnection);

var helpers = require('handlebars-helpers');
var comparison = helpers.comparison();


const routesManager = require("./routes");


db.connect(async function (err) {
    if (err) {
      console.log("App could not connect to the DB. Stopping");
      throw "App could not connect to the DB. Stopping...";

    }
});
  
const app = express();
     //setting veiw engine - handlebars
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//Register routes
app.use('/', require('./routes/index'));


app.listen(process.env.PORT || 3000);


//to handle 404 error
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
 })
  
//to handle error  http 500
app.use(function (err, req, res, next) {
    console.log("in 500 err function" + err)
    res.status(500).send("Schedule Internal Server Error");
})
  

app.g