
var _ = require('lodash');
var config = {
	api: 'https://search.idigbio.org/v2/',
	media: 'https://api.idigbio.org/',
	secret: process.env.IDB_SECRET,
	root: require('path').normalize(__dirname + '/..'),
	app: {
		name: 'iDigBio Portal'
	},
	port: 3000,
	menus: {
		public: {
			home: {
				url: "https://www.idigbio.org",
				label: "iDigBio Home"
			},
			portal: {
				url: "/portal",
				label: "Portal Home"
			},
			search: {
				url: "/portal/search",
				label: "Search Records"
            },
			learning: {
				url: "//www.idigbio.org/content/learning-center",
				label: "Learning Center"
			},
			publishers: {
				url: "/portal/publishers",
				label: "Data",
				submenu: [
					{url: "/portal/publishers", label: 'Publishers'},
					{url: "/portal/collections", label: 'Collections'},
					{url: "https://www.idigbio.org/wiki/index.php/IDigBio_API", label: 'iDigBio API'}
				]
			},
			tools: {
				url: "//www.idigbio.org/content/idigbio-collaborations-enabling-research",
				label: "Research Collaboration"
			},
			contact: {
				url: "//www.idigbio.org/contact/Portal_feedback",
				label: 'Feedback'
			}
		},
		private: {
			profile: {
				url: 'https://www.idigbio.org/login/account',
				label: 'Edit Profile'
			}
		}
	},
	urls: {
		login: "https://www.idigbio.org/login",
		logout: "/logout",
		registerOrg: "https://www.idigbio.org/login/accounts/new",
	}
};

Object.keys(config.menus).forEach(function(key, menu) {
	config.urls[key] = menu.url;
});

if (process.env.NODE_ENV == "beta") {
	_.merge(config, {
		'port': 19199,
		'hostname': 'beta-portal.idigbio.org',
		'redis': {
			host: 'idb-redis-beta.acis.ufl.edu'
		},
		'api': 'https://beta-search.idigbio.org/v2/',
		'media': 'https://beta-api.idigbio.org/'
	});
} else if (process.env.NODE_ENV == "prod") {
	_.merge(config, {
		'port': 19199,
		'hostname': 'portal.idigbio.org',
		'redis': {
			host: 'idb-redis.acis.ufl.edu'
		}
	});
} else if (process.env.NODE_ENV == "local") {
	_.merge(config, {
		'port': 3000,
		'hostname': 'localhost',
		'redis': {
			host: 'localhost'
		}
	});
} else {
	_.merge(config, {
		'port': 3000,
		'hostname': 'idb-api-dev.acis.ufl.edu',
		'redis': {
			host: 'localhost'
		}
	});
};

module.exports = config;
