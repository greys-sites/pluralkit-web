const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname,'/frontend/build')));
app.use(require('cookie-parser')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/api/user', async (req,res)=> {
    if(!req.cookies.user) return res.status(404).send(undefined);
    else {
        var token = req.cookies.user;
        var user = await fetch('https://api.pluralkit.me/s', {
            headers: {
                Authorization: token
            }
        })
        if(user.status != 200) {
            res.status(404).send(undefined)
        } else {
            user = await user.json();
            user.token = req.cookies.user;
            user.members = (await (await fetch('https://api.pluralkit.me/s/'+user.id+"/members")).json()).sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
            try {
                user.fronters = await (await fetch('https://api.pluralkit.me/s/'+user.id+"/fronters")).json()
            } catch(e) {
                user.fronters = {}
            }

            res.status(200).send(user)
        }
    }
})

app.post('/api/login', async (req,res)=> {
    var sys = await fetch('https://api.pluralkit.me/s', {
        method: "GET",
        headers: {
            "Authorization": req.body.token
        }
    })
    console.log(sys.status);
    if(sys.status != 200) {
        res.status(404).send(undefined);
    } else {
        sys = await sys.json();
        sys.token = req.body.token;
        sys.members = (await (await fetch('https://api.pluralkit.me/s/'+sys.id+"/members")).json()).sort((a,b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
        try {
            sys.fronters = await (await fetch('https://api.pluralkit.me/s/'+sys.id+"/fronters")).json()
        } catch(e) {
            sys.fronters = {}
        }
        res.cookie('user',req.body.token)
        res.status(200).send(sys)
    }
})

app.get('/api/logout', async (req,res)=> {
    res.clearCookie('user');
    res.status(200).send(null)
})

app.get('/pkapi/*', async (req,res) => {
    var result = await fetch(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        headers: {
            "Authorization": req.get("Authorization")
        }
    })

    var data;

    if(result.status >= 200 && result.status < 300) {
        data = await result.json();
    } else {
        data = {};
    }

    res.status(result.status).send(data);
});

app.post('/pkapi/*', async (req,res) => {
    var result = await fetch(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    var data;

    if(result.status >= 200 && result.status < 300) {
        data = await result.json();
    } else {
        data = {};
    }

    res.status(result.status).send(data);
});

app.patch('/pkapi/*', async (req,res) => {
    console.log(req.body);
    var result = await fetch(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "PATCH",
        body: JSON.stringify(req.body),
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    var data;

    if(result.status >= 200 && result.status < 300) {
        try {
            data = await result.json();
        } catch(e) {
            data = {};
        }
    } else {
        data = {};
    }

    res.status(result.status).send(data);
});

app.get("/profile/:id", async (req, res)=> {
    var prof = await fetch('https://api.pluralkit.me/s/'+req.params.id);
    if(req.status == 404) {
        var index = fs.readFileSync(path.join(__dirname+'/frontend/build/index.html'),'utf8');
        index = index.replace('$TITLE','404 || PluralKit Web');
        index = index.replace('$DESC','System not found');
        index = index.replace('$TWITDESC','System not found');
        index = index.replace('$TWITTITLE','404 || PluralKit Web');
        index = index.replace('$OGTITLE','404 || PluralKit Web');
        index = index.replace('$OGDESC','System not found');
        index = index.replace('$OEMBED','oembed.json');
        res.send(index);
    } else {
        prof = await prof.json();
        var index = fs.readFileSync(path.join(__dirname+'/frontend/build/index.html'),'utf8');
        index = index.replace('$TITLE',prof.name+' || PluralKit Web');
        index = index.replace('$DESC','System on PluralKit');
        index = index.replace('$TWITDESC','System on PluralKit');
        index = index.replace('$TWITTITLE',prof.name+'PluralKit Web');
        index = index.replace('$OGTITLE',prof.name+'PluralKit Web');
        index = index.replace('$OGDESC','System on PluralKit');
        index = index.replace('$OEMBED','oembed.json');
        res.send(index);
    }
})

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.use("/*", async (req, res, next)=> {
    var index = fs.readFileSync(path.join(__dirname+'/frontend/build/index.html'),'utf8');
    index = index.replace('$TITLE','PluralKit Web');
    index = index.replace('$DESC','Web interface for PluralKit');
    index = index.replace('$TWITDESC','Web interface for PluralKit');
    index = index.replace('$TWITTITLE','PluralKit Web');
    index = index.replace('$OGTITLE','PluralKit Web');
    index = index.replace('$OGDESC','Web interface for PluralKit');
    index = index.replace('$OEMBED','oembed.json');
    res.send(index);
})

const port = process.env.PORT || 8080;
app.listen(port);