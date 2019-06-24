const express = require('express');

const CONTROLLER = require('../controller/index')

const router = express.Router();


router.get('/healthcheck', (req, res) => {
	res.status(200).json({ message: "Server is alive" })
})

router.post("/register", CONTROLLER.register);
router.post("/login", CONTROLLER.login);
router.post("/get_my_data", CONTROLLER.get_my_data);
router.post("/send_friend_request", CONTROLLER.send_friend_request);
router.post("/get_friends_requests", CONTROLLER.get_friends_requests);
router.post("/accept_friend_request", CONTROLLER.accept_friend_request);
router.post("/search_friends", CONTROLLER.search_friends);
router.post("/send_message", CONTROLLER.send_message);
router.post("/get_conversation", CONTROLLER.get_conversation);
router.post("/get_conversations_list",CONTROLLER.get_conversations_list);
router.post("/send_seen_event",CONTROLLER.send_seen_event);

module.exports = router;