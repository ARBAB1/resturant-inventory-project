const router = require('express').Router();
const cors = require("cors");
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { verifyToken } = require('../middleware/verify-token-middleware');


const { signUp, loginUser, getAllUsers } = require('../controller/user-controllers');


router.post('/users/signUp-user', XAPIKEYMIDDLEWARE, signUp);

router.post('/users/login-user', XAPIKEYMIDDLEWARE, loginUser);

router.get('/users/get-all-users', verifyToken, XAPIKEYMIDDLEWARE, getAllUsers);


module.exports = router;

