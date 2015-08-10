//var fields = require('../public/js/fields.js');
//var pg = require('pg').native
var _ = require('lodash')

/*
var dbstring = "tcp://idigbio-api:" + process.env.IDB_DBPASS + "@c18node8.acis.ufl.edu/idb-portal-stats";//idb-api-" + process.env.NODE_ENV;
var client = new pg.Client(dbstring);
client.connect();
*/
var config = {
	api: 'https://search.idigbio.org/v2/',
	crypt_key: process.env.IDB_CRYPT_KEY,
	//client: client,
	secret: process.env.IDB_SECRET,
	root: require('path').normalize(__dirname + '/..'),
	app: {
		name: 'iDigBio Portal'
	},
	port: 3000,
	//fieldobj: new fields(),
	context_lists: {
		people: [
				"person",
		],
		organizations: [
				"organization",
		],
		records: [
				"specimen",
				"taxonomy",
				"collectionevent",
				"locality"
		],
		mediarecords: [
				"media"
		]
	},
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
		api: "https://api.idigbio.org/v1"
	}
};

Object.keys(config.menus).forEach(function(key, menu) {
	config.urls[key] = menu.url;
});

if (process.env.NODE_ENV == "beta") {

	_.merge(config, {
		'port': 19199,
		'hostname': 'beta-portal.idigbio.org',
		'id-server': {
			host: 'beta-ids.idigbio.org',
			path: '/'
		},
		'pub-api-server': {
			host: 'beta-api.idigbio.org',
			path: '/v1/'
		},
		'priv-api-server': {
			host: 'beta-api.idigbio.org',
			path: '/v1/'
		},
		'redis': {
			host: 'idb-redis-beta.acis.ufl.edu'
		},
		'es-options': {
			hosts: [{
					host: 'c16node15.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c16node16.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c16node17.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c16node18.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c16node19.acis.ufl.edu',
					port: 9200
				}
			]
		},
		urls: {
			api: "http://beta-api.idigbio.org/v1"
		}		
	});
} else if (process.env.NODE_ENV == "prod") {
	_.merge(config, {
		'port': 19199,
		'hostname': 'portal.idigbio.org',
		'id-server': {
			host: 'ids.idigbio.org',
			path: '/'
		},
		'pub-api-server': {
			host: 'api.idigbio.org',
			path: '/v1/'
		},
		'priv-api-server': {
			host: 'idb-api.acis.ufl.edu',
			path: '/v1/'
		},
		'redis': {
			host: 'idb-redis.acis.ufl.edu'
		},
		'es-options': {
			hosts: [{
					host: 'c15node1.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c15node2.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c15node3.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c15node4.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c15node5.acis.ufl.edu',
					port: 9200
				}
			]
		}
	});
} else if (process.env.NODE_ENV == "local") {
	_.merge(config, {
		'port': 3000,
		'hostname': 'localhost',
		'id-server': {
			host: 'localhost',
			port: 31338,
			path: '/'
		},
		'pub-api-server': {
			host: 'localhost',
			port: 31337,
			path: '/v1/'
		},
		'priv-api-server': {
			host: 'localhost',
			port: 31337,
			path: '/v1/'
		},
		'redis': {
			host: 'idb-redis-dev.acis.ufl.edu'
		},
		'es-options': {
			hosts: [{
					host: 'localhost',
					port: 9200
				}
			]
		},
		urls: {
			api: "http://localhost:19197/v1"
		}
	});
} else {
	_.merge(config, {
		'port': 3000,
		'hostname': 'idb-api-dev.acis.ufl.edu',
		'id-server': {
			host: 'idb-api-dev.acis.ufl.edu',
			port: 9198,
			path: '/'
		},
		'pub-api-server': {
			host: 'idb-api-dev.acis.ufl.edu',
			port: 9197,
			path: '/v1/'
		},
		'priv-api-server': {
			host: 'idb-api-dev.acis.ufl.edu',
			port: 9197,
			path: '/v1/'
		},
		'redis': {
			host: 'idb-redis-dev.acis.ufl.edu'
		},
		'es-options': {
			hosts: [{
					host: 'c17node9.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c17node10.acis.ufl.edu',
					port: 9200
				}, {
					host: 'c17node11.acis.ufl.edu',
					port: 9200
				}
			]
		},
		urls: {
			api: "http://localhost:19197/v1"
		}
	});
}

module.exports = config