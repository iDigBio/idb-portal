
var https = require('https');
var http = require('http');
var _ = require('lodash');
var openid = require('openid');


module.exports = function(app, config) {
    var relyingParty = new openid.RelyingParty(
        'https://www.idigbio.org/portal/verify', // Verification URL (yours) MUST have full url with protocol
        null, // Realm (optional, specifies realm for OpenID authentication)
        true, // Use stateless verification
        false, // Strict mode
        []
    );

    //var helper = require('../../lib/helper')(app,config);

    return {
        login: function(req, res) {
            res.render('login.html');
        },
        authenticate: function(req, res) {
            var identifier = req.query.openid_identifier,
            firstname = req.query.firstname,
            lastname = req.query.lastname,
            login = req.query.login,
            email = req.query.email;
            //console.log("this is the identifier: "+ identifier);
            //Resolve identifier, associate, and build authentication URL
            relyingParty.authenticate(identifier, false, function(error, authUrl) {
                if (error) {
                  res.writeHead(200);
                  res.end('Authentication failed: ' + error.message);
                  console.log('authentication failed: ' + error.message +  ' ' + identifier);
                } else if (!authUrl) {
                  res.writeHead(200);
                  res.end('Authentication failed');
                  console.log('authentication failed');
                } else {
                    req.session.login = login;
                    res.writeHead(302, {
                        Location: authUrl 
                    });
                    res.end();
                } 
            });  
        },
        verify: function(req, res) {
            // Verify identity assertion
            // NOTE: Passing just the URL is also possible
            relyingParty.verifyAssertion(req, function(error, result) {
                //sres.writeHead(200);
                //console.log(result.authenticated);
                var return_to = req.query.return_to ? req.query.return_to : '/portal';
                if(!error && result.authenticated){
                    if(req.xhr){
                       res.json({authenticated: true});
                    }else{
                       res.redirect(return_to); 
                    }
                }else{
                    res.redirect('/portal');
                }
            });
        },
        logout: function(req, res) {
            var logouturl = "https://www.idigbio.org/login/sessions/destroy";
            delete req.session.login;
            if(req.xhr){
                res.send(200);
            }else{
                if(req.query.return_to){
                    res.redirect(req.query.return_to);
                }else{
                    res.redirect('/portal');
                }
            }
        }
    }
}
