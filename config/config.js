
var _ = require('lodash');
var config = {
	api: 'https://search.idigbio.org/v2/',
	crypt_key: process.env.IDB_CRYPT_KEY,
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
			tutorial: {
				url: "/portal/tutorial",
				label: "Tutorial"
			},
			publishers: {
				url: "/portal/publishers",
				label: "Our Data",
				submenu: [
					{url: "/portal/publishers", label: 'Publishers'},
					{url: "/portal/collections", label: 'Collections'},
					{url: "https://www.idigbio.org/wiki/index.php/IDigBio_API", label: 'iDigBio API'}
				]
			},
			tools: {
				url: "//www.idigbio.org/content/community-research-tools",
				label: "Research Tools"
			},
			contact: {
				url: "//www.idigbio.org/contact",
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
		'api': 'https://beta-search.idigbio.org/v2/'		
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
			host: 'idb-redis-dev.acis.ufl.edu'
		}
	});
} else {
	_.merge(config, {
		'port': 3000,
		'hostname': 'idb-api-dev.acis.ufl.edu',
		'redis': {
			host: 'idb-redis-dev.acis.ufl.edu'
		}
	});
};

module.exports = config;