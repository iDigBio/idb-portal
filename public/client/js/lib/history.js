module.exports = function(){
    initialize: function(){

    },
    getHistory: function(){
        var his = localStorage
    },
    load: function(){
        if(!_.isUndefined(localStorage)){
            try{
                var history = JSON.parse(localStorage.getItem('history'));
                //sanity check for search object refactors
                if(history.hstates.length > 0 && _.isUndefined(history.hstates[0].query.sortName)){
                    localStorage.clear();
                }else{
                    this.set('hstates', history.hstates); 
                }
            }catch(err){
                //clear local storage if it cannot be loaded;
                localStorage.clear();
            }
            this.trigger('change:hstates loaded');
        }else{
            console.log('history will not work on this browser!');
        }
    },
    save: function(){
        if(localStorage){
            localStorage.setItem('history',JSON.stringify({"hstates": this.get('hstates')}));   
        }       
    },
    push: function(searchstate){
        var s = this.get('hstates');
        //deep clone with JSON api
        s.unshift(JSON.parse(JSON.stringify(searchstate)));
        while(s.length > 15){
            s.pop();
        }
        this.set('hstates',_.clone(s));
        this.trigger('change:hstates');
        this.save();
    },
    //for keeping history in sync with current state
    updateLast: function(searchstate){
        var states = _.clone(this.get('hstates')), state = states[0];
        //merge properties
        if(typeof state !== 'undefined'){
            _.extend(state,searchstate);
            this.set('hstates',states);
            this.save();            
        }
    },
    isEmpty: function(){
        if(this.get('hstates').length>0){
            return false;
        }else{
            return true;
        }
    },
    clear: function(){
        this.set('hstates',[]);
        this.save();
    }
}