const mongoose = require('mongoose');
const CONFIG = require('../config')


//Se face conexiunea la baza de date cu mongoose
mongoose.connect(CONFIG.DB_ADDRESS, { useNewUrlParser: true })
	.then(data => {
		console.log("Connected to DB")
	})
	.catch(err => {
		console.log(err);
	})
//Se extrage contructorul de schema
var Schema = mongoose.Schema;

//Se creeaza schema utilizatorului cu toate constrangerile necesare
var UserSchema = new Schema({
	username: { type: String, lowercase: true, required: true, unique: true },
	password: { type: String, required: true },
	email: { type: String, lowercase: true, required: true, unique: true },
	friends: {
		type: Array, required: true, of: {
			user_id: { type: String, required: true },
			accepted: { type: Boolean, default: false, required: true },
			isSender: { type: Boolean, default: false, required: true }
		}
	},
	descriere: { type: String, required: true },
	link_poza: { type: String, required: false },
	conversatii: {
		type: Array, of: {
			id_conversatie: String,
			participanti: Array,
			mesaje: {
				type: Array, of: {
					id_participant: String,
					data_trimitere: Date,
					continut: String,
					vazut: Boolean
				}
			}
		}
	}
})

//Se adauga schema sub forma de "Colectie" in baza de date
var User = mongoose.model("users", UserSchema);
//Se exporta modelul de control
module.exports = User;