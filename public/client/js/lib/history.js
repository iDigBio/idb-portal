module.exports = function(){
    //initialize history on new [function name]
    this.history=[];
    this.version= 1;
    var self=this;
    (function(){
        if(!_.isUndefined(localStorage)){
            if(!_.isUndefined(localStorage.history)){
                var history = JSON.parse(localStorage.getItem('history'));
                if(typeof history.version == 'number' && history.version === self.version){
                    self.history = history.hstates;
                }else{
                    self.history = [];
                }
            }
        }else{
            console.log('history will not work on this browser!');
        }
    })(this)

    this.push = function(searchState){
        this.history.unshift(_.cloneDeep(searchState));
        while(this.history.length > 15){
            this.history.pop();
        }
        this.save();
    }

    this.save = function(){
        localStorage.setItem('history', JSON.stringify({hstates: this.history, version: self.version}));
    }

    this.updateLast = function(searchState){
        this.history[0]=_.cloneDeep(searchstate);
        this.save();
    }
    
    this.clear = function(){
        this.history = [];
        localStorage.setItem('history',JSON.stringify({hstates: [], version: self.version}));
    }

    this.isEmpty = function(){
        if(this.history.length>0){
            return false;
        }else{
            return true;
        }
    }
    /*
    *Define single item settings for local storage.
    **/
    this.set = function(name, value){
        return localStorage.setItem(name,value);
    }

    this.get = function(name){
        return localStorage.getItem(name);
    }

    this.remove = function(name){
        return localStorage.removeItem(name);
    }
}