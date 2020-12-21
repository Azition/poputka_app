const express = require('express');
const app = express();
const vk_bot_route  = require('./routes/vk_bot');
const port = 80;

app.use(express.json());
app.use('/vk_bot', vk_bot_route);

app.listen(port, function() {
	console.log('Start server on port 80');
});