const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const request = require('request');


//Load Input Validator
const validateRegisterInput = require('../validation/register');

//Load Login Validator
const validateLoginInput = require('../validation/login');

const User = require('../models/Users');
const Location = require('../models/Location')



router.get('/',(req,res)=>{
	res.render('landing');
})

//@route GET users/register
router.get('/register',(req,res)=>{
	res.render('register');
})

//@route Post users/register

router.post('/register',(req,res)=>{
	const {errors, isValid} = validateRegisterInput(req.body);

	if(!isValid){
		return res.status(400).json(errors);
	}

	User.findOne({email : req.body.email})
		.then(user=>{
			if(user)
			{
				return res.status(400).json({email:'email already exist'});
			}else{

			console.log(req.body.email);

			const newUser = new User({
				name:req.body.name,
				email:req.body.email,
				password:req.body.password
			});

			console.log(newUser);

			bcrypt.genSalt(10,(err,salt)=>{
				bcrypt.hash(newUser.password,salt,(err,hash)=>{
					if(err) throw err;
					newUser.password = hash;
					newUser.save()
					.then(user=>res.json(user))
					.catch(err=> console.log(err));
					});
				});
			}	
		});
});

//@route GET users/login

router.get('/login',(req,res)=>{
	res.render('login');
})

router.post('/login',(req,res)=>{
	const {errors , isValid} = validateLoginInput(req.body);
	if(!isValid){
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	User.findOne({email})
	.then(user =>{
		//check for user
		if(!user){
			errors.email = 'User Not found';
			return res.status(404).json(errors);
		}

		//Check Password

		bcrypt.compare(password,user.password)
		.then(isMatch=>{
			if(isMatch){
				const payload  = {id:user.id,name:user.name}
				//Sign Tokens
				jwt.sign(
					payload,
					'secret',
					{expiresIn:3600},
					(err,token)=>{
						res.render('maps');
					}
				);
			}
			else{
				errors.password = 'Password Incorrect';
				return res.status(404).json(errors);
			}


		});
			
	});

});

 router.post('/maps',(req,res)=>{

 	var search  = req.body.search;
 	search  = search.replace(/ /g,'%20');
 	var url  = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input='+ search + '&key=AIzaSyD-wj8b80uuFdidH9JPWZmA0W4ipDP6bWA&sessiontoken=1234567890';
 	console.log(url);
 		request(url,function(error,response,body){
   		if(!error && response.statusCode==200){
	   		var data = JSON.parse(body);
	   		res.render('results',{data:data});
   		} 
   	});

 });

 router.get('/maps/:id',(req,res)=>{
 	var param  = req.params.id;
 	var url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='+ param + '&fields=geometry&key=AIzaSyD-wj8b80uuFdidH9JPWZmA0W4ipDP6bWA&sessiontoken=1234567890';
 	request(url,function(error,response,body){
 		if(!error && response.statusCode==200){
 			var data = JSON.parse(body);
 			var coord = data.result.geometry.location;
 			console.log(coord);
 			const newCoord = new Location({
 				
 				Coordinates:{
 				    Longitude : coord.lng,
 					Latitude : coord.lat
 				}
 			});
 			newCoord.save();

 			res.render('finalpage',{coord:coord});
 		}
 	});
 });



module.exports = router;