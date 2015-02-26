require('jquery');
module.exports = {
    host: '//beta-search.idigbio.org/v2/',
    search: function(query,callback){
        this._basic('POST','search/',query,callback);
    },
    media: function(arg1,arg2){
        this._basic('POST','media/',query,callback);
    },
    mapping: function(arg1,arg2){
        this._basic('POST','mapping/',query,callback);
    },
    view: function(type,uuid,callback){
        this._basic('GET','view/'+type+'/'+uuid,callback);
    },
    summary: function(type,query,callback){
        this._basic('POST','summary/'+type,query,callback);
    },
    _basic: function(method,arg1,arg2,arg3){
        var options={
            error: function(jqxhr,status,error){
                console.log(status +': '+error);
            },
            dataType: 'json',
            contentType: 'application/json',
            type: method
        }
        var path=this.host;
        [arg1,arg2,arg3].forEach(function(arg){
            switch(typeof(arg)){
                case 'object':
                    options.data=JSON.stringify(arg);
                    break;
                case 'string':
                    path+=arg;
                    break;
                case 'function':
                    options.success = function(response){
                        arg(response);
                    }
                    break;
            }
        });
        $.ajax(path,options);        
    }
}