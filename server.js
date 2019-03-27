const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

app.use(express.static(path.join(__dirname,'/frontend/build')));


app.get('/api/', (req,res) => {
    fetch(`https://pkapi.astrid.fun${req.path.replace("/api","")}`, {
    	headers: {
    		"X-Token": req.get("X-Token")
    	},
    	body: req.body
    })
    	.then(resp => resp.json())
    	.then(data => res.send(data));
});

app.post('/api/*', (req,res) => {
    fetch(`https://pkapi.astrid.fun${req.path.replace("/api","")}`, {
    	headers: {
    		"X-Token": req.get("X-Token")
    	},
    	body: req.body
    })
    	.then(resp => resp.json())
    	.then(data => res.send(data));
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/frontend/build/index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port);