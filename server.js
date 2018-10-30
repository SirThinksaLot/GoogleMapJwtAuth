const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport  = require('passport');
const userRoute = require('./routes/users');

const app = express();

//BodyParser Middleware

app.use(bodyParser.urlencoded({ extended:false}));
app.use(bodyParser.json());

//DB config
mongoose.connect("mongodb://localhost:27017/JwtAuthGoogleMap",{useNewUrlParser:true});

app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

//Passport Middleware
app.use(passport.initialize());

//Passport Config

	require('./config/passport')(passport);


	//use routes
	app.use(userRoute);

app.listen(3000,()=>{
	console.log('Server started');
})