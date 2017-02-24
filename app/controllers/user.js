
var openid = require('openid');

import config from 'config/config'; // eslint-disable-line no-unused-vars
import logger from 'app/logging'; // eslint-disable-line no-unused-vars

var relyingParty = new openid.RelyingParty(
    'https://www.idigbio.org/portal/verify', // Verification URL (yours) MUST have full url with protocol
    null, // Realm (optional, specifies realm for OpenID authentication)
    true, // Use stateless verification
    false, // Strict mode
    []
);

export default {
    login: function(req, res) {
        res.render('login.html');
    },
    authenticate: function(req, res) {
        var identifier = req.query.openid_identifier;
        // var firstname = req.query.firstname;
        // var lastname = req.query.lastname;
        var login = req.query.login;
        // var email = req.query.email;
        // console.log("this is the identifier: "+ identifier);
        // Resolve identifier, associate, and build authentication URL
        relyingParty.authenticate(identifier, false, function(error, authUrl) {
            if(error) {
              res.writeHead(200);
              res.end('Authentication failed: ' + error.message);
              logger.error('authentication failed: ' + error.message +  ' ' + identifier);
            } else if(authUrl) {
                req.session.login = login;
                res.writeHead(302, {
                    Location: authUrl
                });
                res.end();
            } else {
              res.writeHead(200);
              res.end('Authentication failed');
              logger.warn('authentication failed');
            }
        });
    },
    verify: function(req, res) {
        // Verify identity assertion
        // NOTE: Passing just the URL is also possible
        relyingParty.verifyAssertion(req, function(error, result) {
            // sres.writeHead(200);
            // console.log(result.authenticated);
            var return_to = req.query.return_to ? req.query.return_to : '/portal';
            if(!error && result.authenticated) {
                if(req.xhr) {
                   res.json({authenticated: true});
                } else {
                   res.redirect(return_to);
                }
            } else {
                res.redirect('/portal');
            }
        });
    },
    logout: function(req, res) {
        // var logouturl = "https://www.idigbio.org/login/sessions/destroy";
        delete req.session.login;
        if(req.xhr) {
            res.send(200);
        } else if(req.query.return_to) {
                res.redirect(req.query.return_to);
            } else {
                res.redirect('/portal');
            }
    }
};
