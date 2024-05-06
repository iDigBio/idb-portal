if(typeof window === "undefined") {
    var window = global;
}

module.exports = {
    host: (function(){
        if(typeof window.idbapi == 'object' && typeof window.idbapi.host == 'string'){
            return window.idbapi.host;
        } else if (process.env.NODE_ENV == "beta") {
            return 'https://beta-search.idigbio.org/v2/'
        } else{
            return 'http://localhost:19196/v2/';
        }
    }).call(),
    media_host: (function(){
        if(typeof window.idbapi == 'object' && typeof window.idbapi.media_host == 'string'){
            return window.idbapi.media_host;
        } else if(process.env.NODE_ENV == "beta"){
            return 'https://api.idigbio.org/';
        } else {
            return 'https://api.idigbio.org/';
        }
    }).call(),
    search: function(query,callback){
        this._basic('POST','search/records/',query,callback);
    },
    media: function(query,callback){
        this._basic('POST','search/media/',query,callback);
    },
    publishers: function(query,callback){
        this._basic('POST','search/publishers/',query,callback);
    },
    recordsets: function(query,callback){
        this._basic('POST','search/recordsets/',query,callback);
    },
    createMap: function(query,callback){
        this._basic('POST','mapping/',query,callback);
    },
    mapping: function(path,callback){
        this._basic('GET','mapping/'+path,callback);
    },
    view: function(type,uuid,callback){
        this._basic('GET','view/'+type+'/'+uuid,callback);
    },
    summary: function(type,query,callback){
        this._basic('POST','summary/'+type,query,callback);
    },
    countRecords: function(query,callback){
        this.summary('count/records/',query,callback);
    },
    _basic: function (method, path, data, callback) {

        const url = this.host + path;  // Proper URL construction
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify(data);

        fetch(url, {
            method: method,
            headers: headers,
            body: method !== 'GET' ? body : undefined  // Correct use of body in fetch
        }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                response.json().then((jsonresp) => {
                    if (typeof data === 'function') {
                        data(jsonresp)
                    }
                    else {
                        callback(jsonresp)
                    }

                });

            });

    }

};
