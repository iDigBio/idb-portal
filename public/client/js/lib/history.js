module.exports = function(){
    //initialize history on new [function name]
    this.history=[],self=this;
    (function(){
        if(!_.isUndefined(localStorage)){
            if(!_.isUndefined(localStorage.history)){
                var history = JSON.parse(localStorage.getItem('history'));
                self.history = history.hstates;
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
        localStorage.setItem('history', JSON.stringify({hstates: this.history}));
    }

    this.updateLast = function(searchState){
        this.history[0]=_.cloneDeep(searchstate);
        this.save();
    }
    
    this.clear = function(){
        this.history = [];
        localStorage.setItem('history',JSON.stringify({hstates: []}));
    }

    this.isEmpty = function(){
        if(this.history.length>0){
            return false;
        }else{
            return true;
        }
    }
}