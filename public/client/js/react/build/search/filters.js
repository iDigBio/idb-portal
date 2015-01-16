/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

module.exports = Filters = React.createClass({displayName: 'Filters',
    statics: {
        newFilterProps: function(term){
            var type = fields.byTerm[term].type;
            switch(type){
                case 'text':
                    return {name: term, type: type, text:'', exists: false, missing: false};
                case 'daterange':
                    return {name: term, type: type, range:{gte: '', lte: ''}, exists: false, missing: false};
                case 'numericrange':
                    return {name: term, type: type, range:{gte: false, lte: false}, exists: false, missing: false};
            }
        },
        defaultFilters: function(){
            var filters=[],self=this;
            ['datecollected','genus','specificepithet'].forEach(function(item){
                filters.push(Filters.newFilterProps(item));
            });   
            return filters;
        }      
    }, 

    filterPropsChange: function(filterObj){
        var list = this.filters(),self=this;
        var filters = this.props.filters;
        filters[list.indexOf(filterObj.name)] = filterObj;
        //this.setState({filters: filters},function(){
        //_.defer(this.props.searchChange,'filters',filters);
        this.props.searchChange('filters',filters);
    },

    makeFilter: function(filter){
        //var type = fltrObj.type, name = fltrObj.name;
        //var type = 'text';
        var key= filter.name;// + Date.now();
        switch(filter.type){
            case 'text':
                return(
                    TextFilter({key: key, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                ); 
            case 'daterange':
                return (
                    DateRangeFilter({key: key, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
            case 'numericrange':
                return (
                    NumericRangeFilter({key: key, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
        }
    },
    resetFilters: function(){
        var self=this;
        //this.setState({filters: self.defaultFilters()},function(){
            self.props.searchChange({
                'filters': Filters.defaultFilters(),
                'image': false,
                'geopoint': false,
                'fulltext': ''
            });
            //self.props.searchChange('image', false);
        //});
    },
    clearFilters: function(){
        var filters=[],self=this;
        this.props.filters.forEach(function(item){
            filters.push(Filters.newFilterProps(item.name));
        });
        //this.setState({filters: filters},function(){
            this.props.searchChange({
                'filters': filters,
                'image': false,
                "geopoint": false
            });
        //})
    },
    addFilter: function(event){
        //var flist = this.filters();
        event.preventDefault();
        var cur = this.props.filters;
        cur.unshift(Filters.newFilterProps(event.currentTarget.value));
        //this.setState({filters: cur});
        this.props.searchChange('filters',cur);
        return false;
    },
    removeFilter: function(event){
        event.preventDefault();
        var term = event.currentTarget.attributes['data-remove'].value;
        var cur = this.props.filters, filters=this.filters();
        cur.splice(filters.indexOf(term),1);
        //this.setState({filters: cur});
        this.props.searchChange('filters',cur);
        return false;
    },
    filters: function(){
        var list = [];

        _.each(this.props.filters,function(item){
            list.push(item.name);
        });
        return list;
    },
    scrollFilters: function(){
        $('#filters-holder').animate({
            scrollTop: $('#filters-holder').height()
        });
        return false;
    },
    render: function(){
        var self=this;
       
        var fgroups =[];
        var flist = self.filters();
        //filter select list 
        _.each(fields.searchGroups,function(val){
            var fltrs = [];
            _.each(fields.byGroup[val],function(field){
                if(field.hidden){
                    //noop
                }else{
                    var disabled = flist.indexOf(field.term) === -1 ? '' : 'disabled';
                    fltrs.push(
                            React.DOM.option({disabled: disabled, value: field.term, key: field.term}, 
                                field.name
                            )
                    );
                }
            });
            fgroups.push(
              React.DOM.optgroup({key: val, label: fields.groupNames[val]}, 
                "  ", fltrs
              )
            );
        });
        //filters
        var filters = [];
        _.each(this.props.filters,function(item){
            filters.push(
                self.makeFilter(item)
            )
        })

        var scrollDisplay = 'none';
        if(filters.length>3){
            scrollDisplay='block';
        }
        return (
            React.DOM.div({className: "section "+this.props.active, id: "filters"}, 
                React.DOM.div({className: "option-group", id: "filter-select"}, 
                    React.DOM.select({className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                        React.DOM.option({value: "0", defaultValue: true, className: "default"}, "Add a field"), 
                        fgroups
                    ), 
                    React.DOM.a({className: "btn", onClick: this.clearFilters}, 
                        "Clear"
                    ), 
                    React.DOM.a({className: "btn", onClick: this.resetFilters}, 
                        "Reset"
                    )
                ), 
                React.DOM.div({id: "filters-holder", className: "options-holder"}, 
       
                        filters
                
                ), 
                React.DOM.div({id: "filter-scroller", onClick: this.scrollFilters}, 
                    React.DOM.span({style: {'display': scrollDisplay}}, 
                        "↓ Scroll To Bottom ↓"
                    )
                )
            )
        );
    }
});

var TextFilter = React.createClass({displayName: 'TextFilter',
    componentWillMount: function(){
        var self = this;
        //function for limiting execution of consecutive key strokes
        this.debouncedTextType = _.debounce(function(){
            self.props.changeFilter(self.props.filter); 
        },500,{leading: false, trailing: true});
    },
    getInitialState: function(){
        return {text: this.props.filter.text}
    },
    presenceClick: function(event){
        var filter = this.props.filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                filter.exists = true;
                filter.missing = false;                
            }else if(event.currentTarget.value=='missing'){
                filter.exists = false;
                filter.missing = true;
            }
        }else{
            filter.exists = false;
            filter.missing = false;
        }
        this.props.changeFilter(filter);
    },
    textType: function(event){
        var text = event.currentTarget.value, self=this;
        var filter = this.props.filter;//, filter=filters[ind];   
        filter.text = text;
        this.setState({text: text},function(){
            this.debouncedTextType();
        })
        //
        //this.props.changeFilter(filter);
    },
    componentWillReceiveProps: function(nextProps){
  
        this.setState({text: nextProps.filter.text});
    },
    setAutocomplete: function(event){
        var self=this;
        $(event.currentTarget).autocomplete({
            source: function(searchString, respCallback) {
                var name = this.element[0].name;//$(event.currentTarget).attr('data-name');
                var split = searchString.term.split('\n'),
                last = split[split.length-1].toLowerCase(),
                //field = fields.byTerm[name].term,
                query = {"aggs":{},"from":0,"size":0};
                query.aggs["static_"+name]={"terms":{"field":name,"include":"^"+last+".*","exclude":"^.{1,2}$","size":15}};
        
                searchServer.esQuery('records', query, function(resp) {
                    var list = [];
                    $.each(resp.aggregations['static_' + name]['buckets'], function(index, obj) {
                        list.push(obj.key);
                    });
                    respCallback(list);
                });
            },
            focus: function (event,ui){
                //adaption for textarea input with "or" query
                var input = $(this).val().split('\n');
                if(input.length > 1){
                    input.pop();//remove partial line
                    ui.item.value = input.join('\n') + '\n' + ui.item.value;
                }    
            },
            messages: {
                noResults: '',
                results: function() {}
            },
            select: function(event,ui){
                var filter = self.props.filter;//, filter=filters[ind];   
                var cont = filter.text.split('\n');
           
                cont[cont.length-1] = ui.item.label;

                filter.text = cont.join('\n');
                self.props.changeFilter(filter);                 
            }
            
        });
    },
    getSynonyms: function(event){
        event.preventDefault();
        var text = this.props.filter.text.split('\n'),self=this;
        //dont run search for blank text
        if(!_.isEmpty(text[0].trim())){
            //$(event.currentTarget).attr('disabled','disabled');
            //$(event.currentTarget).find('.syn-loader').show();
            var output = [];
            async.each(text,function(item,callback){
                var val = helpers.strip(item);
                if(val.length > 0){
                    output.push(val);
                    $.ajax({
                        url: '/portal/eol_api/search/1.0.json?page=1&q='+val, //'http://eol.org/api/search/1.0.json?page=1&q='+val,
                        type: 'GET',
                        crossDomain: true,
                        dataType: 'jsonp',
                        success: function(resp) { 
                           
                            if(resp.results.length > 0){
                                var rd = 2; //results index depth to search
                                for(var i=0;i<=rd;i++){
                                    if(!_.isUndefined(resp.results[i])){
                                        var res = resp.results[i].content.split(';');
                                        res.forEach(function(it,ind){
                                            var syn = helpers.strip(it.toLowerCase());
                                            if(text.indexOf(syn)=== -1){
                                                output.push(syn);
                                            }
                                        });
                                    }
                                }
                            }
                            callback();
                        },
                        error: function(e,f){
                            console.log('synonym lookup failed'); 
                            callback();
                        }
                    });                     
                }else{
                    callback();
                }
            },function(err){
                //ta.val(output.join('\n'));
                var filter = self.props.filter;
                filter.text = output.join('\n');
                self.props.changeFilter(filter);
                //$(event.currentTarget).find('.syn-loader').hide();
                //$(event.currentTarget).removeAttr('disabled');
            });            
        }        
    },
    render: function(){
        var filter = this.props.filter,disabled=false;
        var name = filter.name, label = fields.byTerm[name].name;
        var syn = React.DOM.span(null),cl='text';
        if(fields.byTerm[name].synonyms){
            syn=React.DOM.a({onClick: this.getSynonyms}, "Add EOL Synonyms");
            cl+=' syn'
        }
        if(filter.exists || filter.missing){
            disabled=true;
        }
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.a({className: "remove", href: "#", onClick: this.props.removeFilter, 'data-remove': name}, 
                    React.DOM.i({className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.DOM.label({className: "filter-name"}, label), 
                React.DOM.div({className: cl}, 
                syn, 
                    React.DOM.textarea({className: "form-control", name: name, 'data-name': name, 
                        placeholder: fields.byTerm[name].dataterm, 
                        disabled: disabled, 
                        onChange: this.textType, 
                        onFocus: this.setAutocomplete, 
                        value: this.state.text
                    }
                    )
                    
                ), 
                React.DOM.div({className: "presence"}, 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: filter.exists}), 
                            "Present"
                        )
                    ), 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: filter.missing}), 
                            "Missing"
                        )
                    )
                )
            )
        )
    }
});

var DateRangeFilter = React.createClass({displayName: 'DateRangeFilter',
    dateChange: function(event){
        var date = event.currentTarget.value;
        var filter = this.props.filter;//, filter=filters[ind];   
        filter.range[event.currentTarget.name] = date;
        this.props.changeFilter(filter);     
    },
    showDatePicker: function(event){
        var d = new Date(), self=this, reg = /\d{4}-\d{1,2}-\d{1,2}/;

        $(event.currentTarget).datepicker({
            dateFormat: 'yy-mm-dd',
            yearRange: '1701:'+d.getFullYear(),
            //minDate: mindate,
            //maxDate: maxdate,
            changeYear: true,
            changeMonth: true,
            onSelect: function(date,obj){
                var filter = self.props.filter;//, filter=filters[ind];   
                filter.range[obj.input.context.name] = date;
                self.props.changeFilter(filter);                  
            }
        });
    },
    presenceClick: function(event){
        var filter = this.props.filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                filter.exists = true;
                filter.missing = false;                
            }else if(event.currentTarget.value=='missing'){
                filter.exists = false;
                filter.missing = true;
            }
        }else{
            filter.exists = false;
            filter.missing = false;
        }
        this.props.changeFilter(filter);
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name, label = fields.byTerm[name].name,
        exists = filter.exists ,
        missing = filter.missing,
        disabled = false;
        if(exists || missing){
            disabled=true;
        }
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.a({className: "remove", href: "#", onClick: this.props.removeFilter, 'data-remove': name}, 
                    React.DOM.i({className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.DOM.label({className: "filter-name"}, label), 
                React.DOM.div({className: "dates clearfix pull-right"}, 
                    React.DOM.div({className: "pull-left"}, 
                        "Start:",  
                        React.DOM.input({
                            name: "gte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.dateChange, 
                            onFocus: this.showDatePicker, 
                            value: filter.range.gte, 
                            placeholder: "yyyy-mm-dd"}
                        )
                    ), 
                    React.DOM.div({className: "pull-left"}, 
                        "End:",  
                        React.DOM.input({
                            name: "lte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.dateChange, 
                            onFocus: this.showDatePicker, 
                            value: filter.range.lte, 
                            placeholder: "yyyy-mm-dd"}
                        )
                    )
                ), 
                React.DOM.div({className: "presence"}, 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: exists}), 
                            "Present"
                        )
                    ), 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: missing}), 
                            "Missing"
                        )
                    )
                )
            )
        ) 
    }
})

var NumericRangeFilter = React.createClass({displayName: 'NumericRangeFilter',
    presenceClick: function(event){
        var filter = this.props.filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                filter.exists = true;
                filter.missing = false;                
            }else if(event.currentTarget.value=='missing'){
                filter.exists = false;
                filter.missing = true;
            }
        }else{
            filter.exists = false;
            filter.missing = false;
        }
        this.props.changeFilter(filter);
    },
    valueChange: function(event){
        var filter = this.props.filter;
        var val = event.currentTarget.value;
        if(_.isEmpty(val) || !_.isFinite(val)){
            val = false;
        }
        filter.range[event.currentTarget.name] = val;

        this.props.changeFilter(filter);
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name, label = fields.byTerm[name].name
        exists = filter.exists ,
        missing = filter.missing,
        disabled = false;
        if(exists || missing){
            disabled=true;
        }
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.a({className: "remove", href: "#", onClick: this.props.removeFilter, 'data-remove': name}, 
                    React.DOM.i({className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.DOM.label({className: "filter-name"}, label), 

                React.DOM.div({className: "dates clearfix pull-right"}, 
                    React.DOM.div({className: "pull-left"}, 
                        "Min:",  
                        React.DOM.input({
                            name: "gte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.valueChange, 
                            value: filter.range.gte ?  filter.range.gte : ''}
                        )
                    ), 
                    React.DOM.div({className: "pull-left"}, 
                        "Max:",  
                        React.DOM.input({
                            name: "lte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.valueChange, 
                            value: filter.range.lte ? filter.range.lte : ''}
                        )
                    )
                ), 
                React.DOM.div({className: "presence"}, 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: exists}), 
                            "Present"
                        )
                    ), 
                    React.DOM.div({className: "checkbox"}, 
                        React.DOM.label(null, 
                            React.DOM.input({type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: missing}), 
                            "Missing"
                        )
                    )
                )
            ) 
        )
    }
})