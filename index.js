const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();

app.use(require('cookie-parser')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sortfunc = function(a, b) {
    a = a.display_name ? a.display_name : a.name;
    b = b.display_name ? b.display_name : b.name;

    return (
        a > b ? 1 :
        a < b ? -1 :
        0
    )
}

app.get('/api/user', async (req,res)=> {
    if(!req.cookies.token) return res.status(404).send(undefined);
    else {
        var headers = {
            Authorization: req.cookies.token
        }
        var user = await fetch('https://api.pluralkit.me/s', {headers})
        if(user.status != 200) {
            res.status(404).send(undefined)
        } else {
            user = await user.json();
            user.token = req.cookies.token;
            user.members = (await (await fetch('https://api.pluralkit.me/s/'+user.id+"/members", {headers})).json()).sort(sortfunc);
            
            var fronters = await fetch('https://api.pluralkit.me/s/'+user.id+"/fronters", {headers});
            if(fronters.status == 200) user.fronters = await fronters.json();
            else user.fronters = {};

            res.status(200).send(user)
        }
    }
})

app.get('/api/user/:id', async (req,res)=> {
    var user = await fetch('https://api.pluralkit.me/s/'+req.params.id);
    if(user.status != 200) {
        res.status(404).send(undefined)
    } else {
        user = await user.json();

        var members = await fetch('https://api.pluralkit.me/s/'+user.id+"/members");
        if(members.status == 403) user.members = {private: true};
        else user.members = (await members.json()).sort(sortfunc);

        var fronters = await fetch('https://api.pluralkit.me/s/'+user.id+"/fronters");
        if(fronters.status == 200) user.fronters = await fronters.json();
        else if(fronters.status == 403) user.fronters = {private: true};
        else user.fronters = {};

        res.status(200).send(user)
    }
})

app.post('/api/login', async (req,res)=> {
    var headers = {
        Authorization: req.body.token
    }
    var user = await fetch('https://api.pluralkit.me/s', {headers})
    if(user.status != 200) {
        res.status(404).send(undefined)
    } else {
        user = await user.json();
        user.token = req.body.token;
        user.members = (await (await fetch('https://api.pluralkit.me/s/'+user.id+"/members", {headers})).json()).sort(sortfunc);
        
        var fronters = await fetch('https://api.pluralkit.me/s/'+user.id+"/fronters", {headers});
        if(fronters.status == 200) user.fronters = await fronters.json();
        else user.fronters = {};

        res.cookie('token', req.body.token);
        res.status(200).send(user)
    }
})

app.get('/api/logout', async (req,res)=> {
    res.clearCookie('token');
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

app.patch('/pkapi/*', async (req,res) => {
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

app.delete('/pkapi/*', async (req,res) => {
    var result = await fetch(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "DELETE",
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    res.status(result.status).send({});
});

app.get("/profile/:id", async (req, res)=> {
    var prof = await fetch('https://api.pluralkit.me/s/'+req.params.id);
    if(prof.status != 200) {
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
        index = index.replace('$TWITTITLE',prof.name+' || PluralKit Web');
        index = index.replace('$OGTITLE',prof.name+' || PluralKit Web');
        index = index.replace('$OGDESC','System on PluralKit');
        index = index.replace('$OEMBED','oembed.json');
        res.send(index);
    }
})

app.get("/", async (req, res)=> {
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