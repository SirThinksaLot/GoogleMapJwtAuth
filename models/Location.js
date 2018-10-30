const mongoose  = require('mongoose');
const Schema  = mongoose.Schema;

const LocationQuerySchema  =  new Schema({
	Coordinates:{
		Longitude:String,
		Latitude:String
	},
});

module.exports = Location = mongoose.model('Location',LocationQuerySchema);