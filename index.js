const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const axios    = require('axios');

const indexPage = fs.readFileSync(path.join(__dirname+'/frontend/build/index.html'),'utf8');

const axinst = axios.create({
    validateStatus: (s) => s < 500,
    baseURL: 'https://api.pluralkit.me/v1'
});
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

        var system = (await axinst('/s', {headers}));
        if(system.status != 200) return res.status(404).send(undefined);
        system = system.data;

        try {
            var members = (await axinst('/s/'+system.id+"/members", {headers})).data;
            var fronters = (await axinst('/s/'+system.id+"/fronters", {headers})).data;
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
    var user = await axinst('/s/'+req.params.id);
    if(user.status != 200) {
        res.status(404).send(undefined)
    } else {
        user = {system: user.data};

        var members = await axinst('/s/'+user.system.id+"/members");
        if(members.status == 403) user.members = {private: true};
        else user.members = members.data.sort(sortfunc);

        var fronters = await axinst('/s/'+user.system.id+"/fronters");
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
        var system = (await axinst('/s', {headers})).data;
        var members = (await axinst('/s/'+system.id+"/members", {headers})).data;
        var fronters = (await axinst('/s/'+system.id+"/fronters", {headers})).data;
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
    
    res.cookie('token', req.body.token, {maxAge: 30 * 24 * 60 * 60 * 1000}); // 30 days
    res.status(200).send(user)
})

app.get('/api/logout', async (req,res)=> {
    res.clearCookie('token');
    res.status(200).send(null)
})

const pkApi = (method) => async (req, res) => {
        let request = { method, headers: { authorization: req.get("Authorization") } };
        if (req.body) {
            request.headers["content-type"] = "application/json";
            request.data = JSON.stringify(req.body);
        }
        let result = await axinst(`${req.path.replace("/pkapi","")}`, request);
        res.status(result.status).send(result.data);
};

app.get('/pkapi/*', pkApi("GET"));
app.post('/pkapi/*', pkApi("POST"));
app.patch('/pkapi/*', pkApi("PATCH"));
app.delete('/pkapi/*', pkApi("DELETE"));

app.get("/profile/:id", async (req, res)=> {
    var prof = await axinst('/s/'+req.params.id);
    if(prof.status != 200) {
        var index = indexPage;
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
        var index = indexPage;
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

async function getRoot(_, res) {
    let index = indexPage;
    index = index.replace('$TITLE','PluralKit Web');
    index = index.replace('$DESC','Web interface for PluralKit');
    index = index.replace('$TWITDESC','Web interface for PluralKit');
    index = index.replace('$TWITTITLE','PluralKit Web');
    index = index.replace('$OGTITLE','PluralKit Web');
    index = index.replace('$OGDESC','Web interface for PluralKit');
    index = index.replace('$OEMBED','oembed.json');
    res.send(index);
}

app.get("/", getRoot);
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.use("/*", getRoot);

const port = process.env.PORT || 8080;
app.listen(port);
