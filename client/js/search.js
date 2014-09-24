/* Search Page SPA 
* This is the entry point for the Search page
* All views are rendered as separate Backbone views
* that listen for results or submit queries to the Searchstate model 
* global libs defined here to reduce writing them as locals in every sub view.
****/

window.fields = require('./lib/fields');
window.helpers = require('./search/lib/helpers');
window.queryBuilder = require('./lib/querybuilder');
//models
var SearchState = require('./search/models/searchstate');
var SearchHistory = require('./search/models/history');
//views
//frame
var SearchPage = require('./search/views/page');
//partials
var SearchBox = require('./search/views/searchbox');
var HistoryBox = require('./search/views/historybox');
var MapBox = require('./search/views/mapbox');
var Results = require('./search/views/results');
var AdvancedSearchControls = require('./search/views/searchcontrols');
var AdvancedSearchTerms = require('./search/views/searchterms');
//overlay controler

module.exports = (function(){    
    //LOAD ORDER IS IMPORTANT HERE
    var searchstate = new SearchState; 
    //history  first
    var searchhistory = new SearchHistory;
    //so we can refer to searchstate models history in the views
    searchstate.$h = searchhistory;
    //init views    
    //render basic page frame first
    new SearchPage({model: searchstate});
    //views render themselves on init.
    new SearchBox({model: searchstate});
    new HistoryBox({model: searchstate});
    new MapBox({model: searchstate});
    new AdvancedSearchControls({model: searchstate});
    new AdvancedSearchTerms({model: searchstate});
    new Results({model: searchstate});
    //load history into views
    //setup history listner
    searchhistory.listenTo(searchstate, 'change:query', function(){
        var query = searchstate.get('query');
        //don't save get more/next/paging queries
        //never save "results" attribute to history as its value is determined
        //by the query being run against the search server and current data in iDigBio.
        if(query.from === 0){
            this.push({'query': query, 'terms': searchstate.get('terms'), 'view': searchstate.get('view')});
        }
    });
    //save the latest view change with the current query 
    searchstate.on('change:view', function(){
        searchhistory.updateLast({'view': this.get('view')});    
    });
    //initialize history/query params/for first load
    setTimeout(function(){
        var params = url('?').split('&');
        var states = searchhistory.get('hstates');
        //priorities on page load
        //if query params provided
        if(params.length > 0 && !_.isEmpty(url('?'))){
            var terms = [], query = queryBuilder.basicSearchObject();
            _.each(params,function(pair){
                var split = pair.split('=');
                var fld = split[0], val = decodeURI(split[1].toLowerCase());
                var filter = {"term":{}};
                if(fld.toLowerCase()=='hasimage'){
                    searchstate.setTrigger('view','images');
                    query.hasImage=true;
                }else{
                    if(!_.isUndefined(fields.byTerm[fld]) && !_.isEmpty(val)){
                        terms.push(fields.byTerm[fld].name);
                        query[fld+'-text']=unescape(val);
                    }
                }
            });
            searchstate.setTrigger('terms', _.union(fields.defaults,terms));//
            searchstate.runSearch(query);
            helpers.setSearchForm(query); 
            //clears address bar
            window.history.pushState({},'search',url('path'));
        //if history cached
        }else if(states.length > 0){
            searchstate.setTrigger('terms', _.clone(states[0].terms));
            searchstate.setTrigger('view', _.clone(states[0].view));
            var q = _.clone(states[0].query);
            searchstate.runSearch(q);
            helpers.setSearchForm(q);
        }else{
            //no history
            searchstate.setTrigger('terms',fields.defaults);
            searchstate.runSearch();
        }
    },0);
})();

