require('jquery');
module.exports = {
    host: '//beta-search.idigbio.org/v2/',
    search: function(query,callback){
        this._basicPost('search/',query,callback);
    },
    media: function(query,callback){
        this._basicPost('media/',query,callback);
    },
    mapping: function(query,callback){
        this._basicPost('mapping/',query,callback);
    },
    view: function(type,uuid,callback){
        this._basicGet('view/'+type+'/'+uuid,callback);
    },
    _basicPost: function(type,query,callback){
        $.ajax(this.host+type,{
            data: JSON.stringify(query),
            success: function(response){
                callback(response);
            },
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST'
        });        
    },
    _basicGet: function(viewType,callback){
         $.ajax(this.host+viewType,{
            success: function(response){
                callback(response);
            },
            dataType: 'json',
            contentType: 'application/json',
            type: 'GET'
        });        
    }
}