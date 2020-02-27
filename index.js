const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const axios    = require('axios');

const axinst = axios.create({validateStatus: (s) => s < 500});
const app = express();

app.use(require('cookie-parser')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sortfunc = function(a, b) {
    a = (a.display_name || a.name).toLowerCase();
    b = (b.display_name || b.name).toLowerCase();

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

        var system = (await axinst('https://api.pluralkit.me/s', {headers}));
        if(system.status != 200) return res.status(404).send(undefined);
        system = system.data;

        try {
            var members = (await axinst('https://api.pluralkit.me/s/'+system.id+"/members", {headers})).data;
            var fronters = (await axinst('https://api.pluralkit.me/s/'+system.id+"/fronters", {headers})).data;
        } catch(e) {
            console.log(e);
            res.status(404).send(e.message);
            return;
        }
        
        var user = {
            system,
            members: members.sort(sortfunc),
            token: req.cookies.token,
            fronters: typeof fronters == "object" ? fronters : {}
        };

        res.status(200).send(user)
    }
})

app.get('/api/user/:id', async (req,res)=> {
    var user = await axinst('https://api.pluralkit.me/s/'+req.params.id);
    if(user.status != 200) {
        res.status(404).send(undefined)
    } else {
        user = {system: user.data};

        var members = await axinst('https://api.pluralkit.me/s/'+user.system.id+"/members");
        if(members.status == 403) user.members = {private: true};
        else user.members = members.data.sort(sortfunc);

        var fronters = await axinst('https://api.pluralkit.me/s/'+user.system.id+"/fronters");
        if(fronters.status == 200) user.fronters = fronters.data;
        else if(fronters.status == 403) user.fronters = {private: true};
        else user.fronters = {};

        res.status(200).send(user)
    }
})

app.post('/api/login', async (req,res)=> {
    var headers = {
        Authorization: req.body.token
    }

    try {
        var system = (await axinst('https://api.pluralkit.me/s', {headers})).data;
        var members = (await axinst('https://api.pluralkit.me/s/'+system.id+"/members", {headers})).data;
        var fronters = (await axinst('https://api.pluralkit.me/s/'+system.id+"/fronters", {headers})).data;
    } catch(e) {
        console.log(e);
        res.status(404).send(e.message);
        return;
    }
    
    var user = {
        system,
        members: members.sort(sortfunc),
        token: req.body.token,
        fronters: typeof fronters == "object" ? fronters : {}
    };
    
    res.cookie('token', req.body.token);
    res.status(200).send(user)
})

app.get('/api/logout', async (req,res)=> {
    res.clearCookie('token');
    res.status(200).send(null)
})

app.get('/pkapi/*', async (req,res) => {
    var result = await axinst(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        headers: {
            "Authorization": req.get("Authorization")
        }
    })

    res.status(result.status).send(result.data);
});

app.post('/pkapi/*', async (req,res) => {
    var result = await axinst(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "POST",
        data: JSON.stringify(req.body),
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    res.status(result.status).send(result.data);
});

app.patch('/pkapi/*', async (req,res) => {
    var result = await axinst(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "PATCH",
        data: JSON.stringify(req.body),
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    res.status(result.status).send(result.data);
});

app.delete('/pkapi/*', async (req,res) => {
    var result = await axinst(`https://api.pluralkit.me${req.path.replace("/pkapi","")}`, {
        method: "DELETE",
        headers: {
            "Authorization": req.get("Authorization"),
            "Content-Type": "application/json"
        }
    })

    res.status(result.status).send(result.data);
});

app.get("/profile/:id", async (req, res)=> {
    var prof = await axinst('https://api.pluralkit.me/s/'+req.params.id);
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
        prof = prof.data;
        if(!prof.name) prof.name = "(unnamed)";
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