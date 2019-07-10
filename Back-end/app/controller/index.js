const JWT = require('jsonwebtoken');

const WebSocket = require('ws');

const User = require('../models/users')
const CONFIG = require("../config");

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws, req) {
	ws.on('message', (data) => {
		let info = JSON.parse(data)
		// wss.clients.forEach(el=>console.log(el.id))
		JWT.verify(info.token, CONFIG.JWT_SECRET_KEY, (err, payload) => {
			if (err) {
				console.log(err);
			} else {
				ws.id = payload.id;
				//onconnect -> clientul trimite un prim mesaj gol pentru a oferi serverului un id
				if (info.id_prieten === "1") { return }
				User.findOne({ username: payload.username }, (err, sender) => {
					// aflam indexul prietenului cu care vorbim
					var index = sender.friends.findIndex(el => el.user_id.toString() === info.id_prieten);
					if (index === -1) { console.log("persoana cu acest id nu este prieten"); return; }
					//pregatim un 'mesaj' pentru cazul in care cele 2 pers au mai vorbit si o 'convo'(rbire) pentru cazul contrar
					var mesaj = {
						id_participant: sender._id + '',
						data_trimitere: Date.now(),
						continut: info.continut + '',
						vazut: false
					}
					var convo = {
						id_conversatie: '' + sender._id + info.id_prieten,
						participanti: [sender._id.toString(), info.id_prieten],
						mesaje: [{
							id_participant: sender._id.toString(),
							data_trimitere: Date.now(),
							continut: info.continut,
							vazut: false
						}]
					}
					if (sender.friends[index].accepted === true) {
						let convoIndex = sender.conversatii.findIndex(el => (el.id_conversatie === '' + sender._id + info.id_prieten) ||
							(el.id_conversatie === '' + info.id_prieten + sender._id));
						(convoIndex !== -1) ? sender.conversatii[convoIndex].mesaje.push(mesaj) : sender.conversatii.push(convo);
						sender.markModified('conversatii');
						sender.save();

						User.findById(info.id_prieten, (err, receiver) => {
							let convoIndex = receiver.conversatii.findIndex(el => (el.id_conversatie === '' + sender._id + info.id_prieten) ||
								(el.id_conversatie === '' + info.id_prieten + sender._id));
							(convoIndex !== -1) ? receiver.conversatii[convoIndex].mesaje.push(mesaj) : receiver.conversatii.push(convo);
							receiver.markModified('conversatii');
							receiver.save();
							// res.send(200);
							let convoID = (convoIndex !== -1) ? receiver.conversatii[convoIndex].id_conversatie : convo.id_conversatie;
							wss.clients.forEach(el => {
								if (el.id === info.id_prieten) {
									el.send(JSON.stringify({
										id_conversatie: convoID,
										continut: info.continut,
										id_participant: sender._id
									}))
								}
							})
						})
					}
				})
			}
		})
	})
});

const register = (req, res) => {
	if (req.body && req.body.username && req.body.password && req.body.email) {
		var newUser = new User({
			username: req.body.username,
			password: req.body.password,
			email: req.body.email,
			friends: [],
			descriere: " ",
			link_poza: "https://images.unsplash.com/photo-1522778147829-047360bdc7f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=658&q=80",
			conversatii: []
		})

		newUser.save((err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(409);
			} else {
				res.status(200).json({ message: "Registered with success" })
			}
		})
	} else {
		res.status(422).json({ message: "Please provide all data for register process" })
	}
}

const login = (req, res) => {
	if (req.body && req.body.username && req.body.password) {
		User.findOne({
			username: req.body.username,
			password: req.body.password
		})
			.then(result => {
				if (result == null) {
					res.status(401).json({ message: "Wrong combination" })
				} else {
					var TOKEN = JWT.sign({
						id: result._id,
						username: req.body.username,
						exp: Math.floor(Date.now() / 1000) + CONFIG.JWT_EXPIRE_TIME
					},
						CONFIG.JWT_SECRET_KEY);

					res.status(200).json({ token: TOKEN })
				}
			})
	} else {
		res.status(422).json({ message: "Provide all data" })
	}
}

const get_my_data = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		} else {
			User.findOne({ username: payload.username })
				.then(data => {
					res.status(200).json({ "username": data.username, "link_poza": data.link_poza, "email": data.email })
				})
				.catch(err => {
					res.sendStatus(500); //eroare in baza de date
				})
		}
	})
}

const send_friend_request = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	if (req.body.user_id) {
		JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
			if (err) {
				res.send(403);
			} else {
				User.findOne({ username: payload.username }, (err, doc) => {
					if (doc.friends.find((friend) => friend.user_id === req.body.user_id)) { return res.status(400).json({ message: "Friend request already sent" }) }
					if (req.body.user_id === doc._id + '') {
						return res.status(400).json({ message: "Cannot send friend request to self" })
					}
					doc.friends.push({ user_id: req.body.user_id, accepted: false, isSender: true });
					doc.save();

					User.findOne({ _id: req.body.user_id }, (err, document) => {
						document.friends.push({ user_id: doc._id, accepted: false, isSender: false });
						document.save();
					})
					res.status(200).json({ message: "Friend added successfully" });
				})

					.catch(err => {
						res.sendStatus(500); //eroare in baza de date
					})
			}
		})
	} else {
		res.status(422).json({ message: "Provide all data" })
	}
}

const get_friends_requests = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		} else {
			User.findOne({ username: payload.username }, (err, doc) => {
				var pending = [];
				doc.friends.filter(el => {
					if (el.accepted === false && el.isSender === false) {
						pending.push(el);
					}
				});
				pending = pending.map(el => el.user_id);
				User.find({ _id: { $in: pending } }, (err, arr) => {
					let pending = arr.map(el => { return { id: el._id, username: el.username, poza: el.link_poza } })
					res.status(200).json(JSON.stringify(pending))
				})
			})
		}
	})
}

const accept_friend_request = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		}
		if (!req.body.user_id) {
			res.status(422).json({ message: "Please provide all data for register process" })
		} else {
			User.findOne({ username: payload.username }, (err, doc) => {
				let index = doc.friends.findIndex(el => el.user_id.toString() === req.body.user_id);
				if (index === -1) { return res.status(400).json({ message: "acest_id_nu_a_trimis_o_cerere_de_prietenie" }) }
				if (doc.friends[index].accepted === true) { return res.status(400).json({ message: "deja avem acest prieten" }) }
				if (doc.friends[index].isSender === false) {
					doc.friends[index].accepted = true;
				} else {
					res.status(400).json({ message: "cererea nu poate fi acceptata de persoana care a trimis-o" })
				}
				// doc.friends.splice(index, 1);
				// doc.friends.push({ user_id: req.body.user_id, accepted: true })
				doc.markModified("friends");
				doc.save();
				User.findById(req.body.user_id, (err, dc) => {
					let index = dc.friends.findIndex(el => el.user_id.toString() === payload.id);
					dc.friends[index].accepted = true;
					dc.markModified("friends");
					dc.save();
				})
				res.status(200).json({ message: "Friend added successfully" });
			})
		}
	})
}

const search_friends = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		} else {
			User.findOne({ username: payload.username }, (err, doc) => {
				var friends = doc.friends.filter(el => el.accepted === true);
				friends = friends.map(el => el.user_id);
				var frList = [];
				var stList = [];
				// 10 persoane care au facut match in lista mea de prieteni
				User.find({ $and: [{ _id: { $in: friends } }, { "username": { "$regex": req.body.search, "$options": "i" } }] }).limit(10)
					.exec((err, amici) => {
						frList = amici.map(el => { return { _id: el._id, username: el.username, email: el.email, descriere: el.descriere, link_poza: el.link_poza } });
						// 10 persoane care au facut match si nu sunt in lista mea de prieteni
						User.find({ $and: [{ _id: { $nin: friends } }, { "username": { "$regex": req.body.search, "$options": "i" } }] }).limit(10)
							.exec((err, strangers) => {
								stList = strangers.map(el => { return { _id: el._id, username: el.username, email: el.email, descriere: el.descriere, link_poza: el.link_poza } });
								res.status(200).json([frList, stList]);
							})
					})

			})
		}
	})
}

const send_message = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	if (!req.body.message) {
		return res.send(400);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		} else {
			User.findOne({ username: payload.username }, (err, sender) => {
				// aflam indexul prietenului cu care vorbim
				var index = sender.friends.findIndex(el => el.user_id.toString() === req.body.user_id);
				if (index === -1) { return res.status(400).json({ message: "persoana cu acest id nu este prieten" }) }
				//pregatim un 'mesaj' pentru cazul in care cele 2 pers au mai vorbit si o 'convo'(rbire) pentru cazul contrar
				var mesaj = {
					id_participant: sender._id + '',
					data_trimitere: Date.now(),
					continut: req.body.message + '',
					vazut: false
				}
				var convo = {
					id_conversatie: '' + sender._id + req.body.user_id,
					participanti: [sender._id.toString(), req.body.user_id],
					mesaje: [{
						id_participant: sender._id.toString(),
						data_trimitere: Date.now(),
						continut: req.body.message,
						vazut: false
					}]
				}
				if (sender.friends[index].accepted === true) {
					let convoIndex = sender.conversatii.findIndex(el => (el.id_conversatie === '' + sender._id + req.body.user_id) ||
						(el.id_conversatie === '' + req.body.user_id + sender._id));
					(convoIndex !== -1) ? sender.conversatii[convoIndex].mesaje.push(mesaj) : sender.conversatii.push(convo);
					sender.markModified('conversatii');
					sender.save();

					User.findById(req.body.user_id, (err, receiver) => {
						let convoIndex = receiver.conversatii.findIndex(el => (el.id_conversatie === '' + sender._id + req.body.user_id) ||
							(el.id_conversatie === '' + req.body.user_id + sender._id));
						(convoIndex !== -1) ? receiver.conversatii[convoIndex].mesaje.push(mesaj) : receiver.conversatii.push(convo);
						receiver.markModified('conversatii');
						receiver.save();
						res.send(200);
					})
				}
			})
		}
	})
}

const get_conversation = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		}
		User.findOne({ username: payload.username }, (err, doc) => {
			let convoIndex = doc.conversatii.findIndex(el => el.id_conversatie === req.body.id_conversatie);
			let mesList = doc.conversatii[convoIndex].mesaje.map(el => {
				return { mesajul_meu: el.id_participant === doc._id + '', data_trimitere: el.data_trimitere, continut: el.continut, id_participant: el.id_participant }
			})
			res.status(200).json(JSON.stringify(mesList));
		})
	})
}

const get_conversations_list = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		}
		User.findOne({ username: payload.username }, (err, doc) => {
			let idPrieteni = [], convList = doc.conversatii.map(el => {
				let indexMes = el.mesaje.length - 1;
				let idPrieten = el.participanti.find(el => el !== doc._id.toString());
				idPrieteni.push(idPrieten);
				return {
					lastMes: el.mesaje[indexMes].continut, data_trimitere: el.mesaje[indexMes].data_trimitere, vazut: el.mesaje[indexMes].vazut,
					id_prieten: idPrieten, id_conversatie: el.id_conversatie, participanti: el.participanti
				}
			})
			User.find({ _id: { $in: idPrieteni } }, (err, prieteni) => {
				convList.forEach(((el, i) => {
					// el.username = prieteni[i].username;
					// el.link_poza = prieteni[i].link_poza;
					el.username = prieteni.find(fr => fr._id + '' === el.id_prieten + '').username;
					el.link_poza = prieteni.find(fr => fr._id + '' === el.id_prieten + '').link_poza;
				}))
				res.status(200).json(JSON.stringify(convList));
			})
		})
	})
}

const send_seen_event = (req, res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	if (!req.body.id_conversatie) {
		return res.status(400).json({ message: "lipseste id-ul conversatiei" });
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		}
		User.findOne({ username: payload.username }, (err, viewer) => {
			let indexConvo = viewer.conversatii.findIndex(el => el.id_conversatie === req.body.id_conversatie);
			if (indexConvo === -1) { return res.status(400).json({ message: "conversatia nu a fost gasita" }) }
			viewer.conversatii[indexConvo].mesaje.forEach(el => { if (el.vazut === false) { el.vazut = true } });
			let friendID = viewer.conversatii[indexConvo].participanti.find(el => el !== viewer._id.toString());
			viewer.markModified('conversatii');
			viewer.save();
			User.findById(friendID, (err, sender) => {
				let indexConvo = sender.conversatii.findIndex(el => el.id_conversatie === req.body.id_conversatie);
				sender.conversatii[indexConvo].mesaje.forEach(el => { if (el.vazut === false) { el.vazut = true } });
				sender.markModified('conversatii');
				sender.save();
				res.send(200);
			})
		})
	})
}

const update_picture = (req,res) => {
	if (!req.headers['token']) {
		return res.send(401);
	}
	if (!req.body.link_poza) {
		return res.status(400).json({ message: "lipseste url-ul pozei" });
	}
	JWT.verify(req.headers['token'], CONFIG.JWT_SECRET_KEY, (err, payload) => {
		if (err) {
			res.send(403);
		}
		User.findOne({ username: payload.username },(err,doc)=>{
			doc.link_poza = req.body.link_poza;
			doc.markModified("link_poza");
			doc.save();
			res.send(200);
		})
	})
}

module.exports = {
	register,
	login,
	get_my_data,
	send_friend_request,
	get_friends_requests,
	accept_friend_request,
	search_friends,
	send_message,
	get_conversation,
	get_conversations_list,
	send_seen_event,
	update_picture
}