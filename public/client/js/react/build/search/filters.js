
var React = require('react/addons');
var RCTgroup = React.addons.CSSTransitionGroup;
var idbapi = require('../../../lib/idbapi');


var Filters = module.exports = React.createClass({displayName: "exports",
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
                    React.createElement(TextFilter, {key: key, filter: filter, removeFilter: this.removeFilter, search: this.props.search, changeFilter: this.filterPropsChange})
                ); 
            case 'daterange':
                return (
                    React.createElement(DateRangeFilter, {key: key, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
            case 'numericrange':
                return (
                    React.createElement(NumericRangeFilter, {key: key, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
        }
    },

    clearFilters: function(){
        var filters=[],self=this;
        this.props.filters.forEach(function(item){
            filters.push(Filters.newFilterProps(item.name));
        });
        //this.setState({filters: filters},function(){
            this.props.searchChange({
                'filters': filters
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
                        React.createElement("option", {disabled: disabled, value: field.term, key: field.term}, 
                            field.name
                        )
                    );
                }
            });
            fgroups.push(
              React.createElement("optgroup", {key: val, label: fields.groupNames[val]}, 
                "  ", fltrs
              )
            );
        });
        //filters
        var filters = _.map(this.props.filters,function(item){
            return self.makeFilter(item)
        })

        var scrollDisplay = 'none';
        if(filters.length>3){
            scrollDisplay='block';
        }
        return (
            React.createElement("div", {className: "section "+this.props.active, id: "filters"}, 
                React.createElement("div", {className: "option-group", id: "filter-select"}, 
                    React.createElement("select", {className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                        React.createElement("option", {value: "0", defaultValue: true, className: "default"}, "Add a field"), 
                        fgroups
                    ), 
                    React.createElement("a", {className: "btn", onClick: this.clearFilters, title: "Clear all filter inputs"}, 
                        "Clear"
                    )
                ), 
                React.createElement("div", {id: "filters-holder", className: "options-holder"}, 
                    filters
                ), 
                React.createElement("div", {id: "filter-scroller", onClick: this.scrollFilters}, 
                    React.createElement("span", {style: {'display': scrollDisplay}}, 
                        "↓ Scroll To Bottom ↓"
                    )
                )
            )
        );
    }
});
//custom autocomplete for add all feature
$.widget("custom.IDBAutocomplete", $.ui.autocomplete, {
    _renderItem: function(ul, item){
        var link = $('<a>').attr('href','#').addClass('item').append(item.label);
        var addall = $('<a>').attr('href','#').addClass('all').append('add all')
        return $( "<li>" ).addClass('item-wrapper').append(link).append(addall).appendTo( ul );
    }
})

var TextFilter = React.createClass({displayName: "TextFilter",
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
        var self=this,name;
        var options = {
            source: function(searchString, respCallback) {
                name = this.element[0].name;//$(event.currentTarget).attr('data-name');
                var split = searchString.term.split('\n'),
                last = split[split.length-1].toLowerCase(),
                rq = queryBuilder.buildQueryShim(self.props.search);
                rq[name]={'type':'prefix', 'value': last};
                query = {rq: rq, count: 15, top_fields:[name]};

                idbapi.summary('top/basic/',query, function(resp) {
                    var list = _.map(resp[name], function(v,k){
                        return k;
                    })
                    list.sort();
                    respCallback(list);
                })
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
                cont.pop();
                //cont[cont.length-1] = ui.item.label;
                var mozilla;
                if(!_.isUndefined(event.toElement) && event.toElement.classList.contains('all')){
                    //|| (!_.isUndefined(event.originalEvent.originalEvent.originalEvent.originalTarget.classList) && event.originalEvent.originalEvent.originalEvent.originalTarget.classList.contains('all'))){
                    var rq = queryBuilder.buildQueryShim(self.props.search);;
                    rq[name]={'type':'prefix', 'value': ui.item.label.trim()+' '};
                    var query = {rq: rq, count: 300, top_fields:[name]};
                    cont.push(ui.item.label);
                    idbapi.summary('top/basic/',query, function(resp) {
                        _.each(resp[name], function(v,k){
                            cont.push(k);
                        })
                        filter.text = cont.join('\n');
                        self.props.changeFilter(filter);  
                    })
                }else{
                    cont.push(ui.item.label);
                    filter.text = cont.join('\n');
                    self.props.changeFilter(filter);  
                }
            }
        }
        var fld = fields.byTerm[this.props.filter.name];
        if(_.has(fld,'addall') && fld.addall){
            $(event.currentTarget).IDBAutocomplete(options);
        }else{
            $(event.currentTarget).autocomplete(options);
        }
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
        var filter = this.props.filter,disabled=false,textval;
        var name = filter.name, label = fields.byTerm[name].name;
        var syn = React.createElement("span", null),cl='text';
        if(fields.byTerm[name].synonyms){
            syn=React.createElement("a", {onClick: this.getSynonyms}, "Add EOL Synonyms");
            cl+=' syn'
        }
        if(filter.exists || filter.missing){
            disabled=true;
            textval=fields.byTerm[name].dataterm;
        }else{
            textval=this.state.text;
        }
        return(
            React.createElement("div", {className: "option-group filter", id: name+'-filter', key: name}, 
                React.createElement("a", {className: "remove", href: "#", onClick: this.props.removeFilter, "data-remove": name}, 
                    React.createElement("i", {className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.createElement("label", {className: "filter-name"}, label), 
                React.createElement("div", {className: cl}, 
                syn, 
                    React.createElement("textarea", {className: "form-control", name: name, "data-name": name, 
                        placeholder: fields.byTerm[name].dataterm, 
                        disabled: disabled, 
                        onChange: this.textType, 
                        onFocus: this.setAutocomplete, 
                        value: textval
                    }
                    )
                    
                ), 
                React.createElement("div", {className: "presence"}, 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: filter.exists}), 
                            "Present"
                        )
                    ), 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: filter.missing}), 
                            "Missing"
                        )
                    )
                )
            )
        )
    }
});

var DateRangeFilter = React.createClass({displayName: "DateRangeFilter",
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
            React.createElement("div", {className: "option-group filter", id: name+'-filter', key: name}, 
                React.createElement("a", {className: "remove", href: "#", onClick: this.props.removeFilter, "data-remove": name}, 
                    React.createElement("i", {className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.createElement("label", {className: "filter-name"}, label), 
                React.createElement("div", {className: "dates clearfix pull-right"}, 
                    React.createElement("div", {className: "pull-left"}, 
                        "Start:",  
                        React.createElement("input", {
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
                    React.createElement("div", {className: "pull-left"}, 
                        "End:",  
                        React.createElement("input", {
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
                React.createElement("div", {className: "presence"}, 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: exists}), 
                            "Present"
                        )
                    ), 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: missing}), 
                            "Missing"
                        )
                    )
                )
            )
        ) 
    }
})

var NumericRangeFilter = React.createClass({displayName: "NumericRangeFilter",
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
        var val = event.target.value;
        if(_.isEmpty(val) || !_.isFinite(parseInt(val))){
            val = false;
        }
        filter.range[event.currentTarget.name] = parseInt(val);
        
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
            React.createElement("div", {className: "option-group filter", id: name+'-filter', key: name}, 
                React.createElement("a", {className: "remove", href: "#", onClick: this.props.removeFilter, "data-remove": name}, 
                    React.createElement("i", {className: "glyphicon glyphicon-remove", title: "click to remove this filter"})
                ), 
                React.createElement("label", {className: "filter-name"}, label), 

                React.createElement("div", {className: "dates clearfix pull-right"}, 
                    React.createElement("div", {className: "pull-left"}, 
                        "Min:",  
                        React.createElement("input", {
                            name: "gte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.valueChange, 
                            value: filter.range.gte ?  filter.range.gte : '', 
                            placeholder: fields.byTerm[name].dataterm}
                        )
                    ), 
                    React.createElement("div", {className: "pull-left"}, 
                        "Max:",  
                        React.createElement("input", {
                            name: "lte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: disabled, 
                            onChange: this.valueChange, 
                            value: filter.range.lte ? filter.range.lte : '', 
                            placeholder: fields.byTerm[name].dataterm}
                        )
                    )
                ), 
                React.createElement("div", {className: "presence"}, 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: exists}), 
                            "Present"
                        )
                    ), 
                    React.createElement("div", {className: "checkbox"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: missing}), 
                            "Missing"
                        )
                    )
                )
            ) 
        )
    }
})