import config from 'config/config'; // eslint-disable-line no-unused-vars
import logger from 'app/logging'; // eslint-disable-line no-unused-vars

export default {
  index: function(req, res) {

    res.render('home', {
      activemenu: "portal",
      user: req.user,
      token: req.session._csrf
    });
    //   res.render('home', { activemenu: 'home', user: req.user });
  },
  tutorial: function(req, res) {
    res.render('tutorial', {
      activemenu: 'tutorial',
      user: req.user
    });
  },
};
