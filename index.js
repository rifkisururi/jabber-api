require('dotenv').config()
var xmpp = require('simple-xmpp');
var http = require('http');
var url = require('url');
var md5 = require('md5');

http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var q = url.parse(req.url, true).query;

    var refID = "";
    if (q.refID != undefined) {
        refID = q.refID;
    }

    var status = false;
    if (q.dest != undefined && q.value != undefined && q.key != undefined) {
        var txt = q.dest + q.value + refID;
        var keyMush = md5(txt);

        console.log('baseKey', txt);
        console.log('key', keyMush);

        if (keyMush == q.key) {
            xmpp.send(q.dest, q.value, false);
            console.log('pesan terkirim');
        }
        status = true;
    } else {
        var txt = "terjadi kesalahan";
    }
    res.end(JSON.stringify({ status: status }));
}).listen(parseInt(process.env.RUNNING_PORT));

xmpp.connect({
    jid: process.env.JID,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: parseInt(process.env.PORT)
});

xmpp.on('online', function (data) {
    console.log('Connected with JID: ' + data.jid.user);
    console.log('Yes, I\'m connected!');
});

// pesan masuk
xmpp.on('chat', function (from, message) {
    xmpp.send(from, 'masuk: ' + message);
});

xmpp.on('error', function (err) {
    console.error(err);
});

xmpp.on('subscribe', function (from) {
    if (from === 'a.friend@gmail.com') {
        xmpp.acceptSubscription(from);
    }
});

// check for incoming subscription requests
xmpp.getRoster()