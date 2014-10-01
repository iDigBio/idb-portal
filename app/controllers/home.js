

module.exports = function(app, config) {
	return {
		index: function(req, res) {

			res.render('home', {
				activemenu: "portal",
				user: req.user,
				token: req.session._csrf
			});
			//   res.render('home', { activemenu: 'home', user: req.user });
		},
		tutorial: function(req, res) {
			res.render('tutorial',{
				activemenu: 'tutorial',
				user: req.user
			});
		},
	}
}