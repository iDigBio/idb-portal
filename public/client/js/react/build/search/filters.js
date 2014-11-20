/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

module.exports = React.createClass({displayName: 'exports',
    filterPropsChange: function(filterObj){
        var list = this.filters();
        var filters = this.props.filters;
        filters[list.indexOf(filterObj.name)] = filterObj;
        //this.setState({filters: filters},function(){
        this.props.searchChange('filters',filters);
        //});
        
    },
    newFilterProps: function(name){
        var type = fields.byName[name].type;
        switch(type){
            case 'text':
                return {name: name, type: type, text:{content:'', disabled: false}, exists: false, missing: false};
            case 'daterange':
                return {name: name, type: type, range:{gte: '', lte: '', disabled: false}, exists: false, missing: false};
            case 'numericrange':
                return {name: name, type: type, range:{gte: false, lte: false, disabled: false}, exists: false, missing: false};
        }
    },
    makeFilter: function(filter){
        //var type = fltrObj.type, name = fltrObj.name;
        //var type = 'text';
        switch(filter.type){
            case 'text':
                return(
                    TextFilter({key: filter.name, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                ); 
            case 'daterange':
                return (
                    DateRangeFilter({key: filter.name, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
            case 'numericrange':
                return (
                    NumericRangeFilter({key: filter.name, filter: filter, removeFilter: this.removeFilter, changeFilter: this.filterPropsChange})
                );  
        }
    },
    defaultFilters: function(){
        var filters=[],self=this;
        ['Date Collected','Genus','Specific Epithet'].forEach(function(item){
            filters.push(self.newFilterProps(item));
        });   
        return filters;
    },
    getInitialState: function(){
        var self=this;
        return {filters: self.defaultFilters()};
    },
    resetFilters: function(){
        var self=this;
        //this.setState({filters: self.defaultFilters()},function(){
            self.props.searchChange({
                'filters': self.defaultFilters(),
                'image': false,
                'geopoint': false
            });
            //self.props.searchChange('image', false);
        //});
    },
    clearFilters: function(){
        var filters=[],self=this;
        this.props.filters.forEach(function(item){
            filters.push(self.newFilterProps(item.name));
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
        var cur = this.props.filters;
        cur.unshift(this.newFilterProps(event.currentTarget.value));
        //this.setState({filters: cur});
        this.props.searchChange('filters',cur)
    },
    removeFilter: function(event){
        var name = event.currentTarget.attributes['data-remove'].value;
        var cur = this.props.filters, filters=this.filters();
        cur.splice(filters.indexOf(name),1);
        //this.setState({filters: cur});
        this.props.searchChange('filters',cur);
    },
    filters: function(){
        var list = [];

        _.each(this.props.filters,function(item){
            list.push(item.name);
        });
        return list;
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
                    var disabled = flist.indexOf(field.name) === -1 ? '' : 'disabled';
                    fltrs.push(
                            React.DOM.option({disabled: disabled, value: field.name, key: field.name}, 
                                field.name
                            )
                    );
                }
            });
            fgroups.push(
              React.DOM.optgroup({label: fields.groupNames[val]}, 
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
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group", id: "filter-select"}, 
                    React.DOM.select({className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                        React.DOM.option({value: "0", defaultValue: true}, "Add a field filter"), 
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
                    RCTgroup({transitionName: "filter-trans"}, 
                        filters
                    )
                )
            )
        );
    }
});

var TextFilter = React.createClass({displayName: 'TextFilter',
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
            filter.text.disabled=true;
        }else{
            filter.exists = false;
            filter.missing = false;
            filter.text.disabled = false;
        }
        this.props.changeFilter(filter);
    },
    textType: function(event){
        var text = event.currentTarget.value;
        var filter = this.props.filter;//, filter=filters[ind];   
        filter.text.content = text;
        this.props.changeFilter(filter);     
    },
    setAutocomplete: function(event){
        var self=this;
        $(event.currentTarget).autocomplete({
            source: function(searchString, respCallback) {
                var name = this.element[0].name;//$(event.currentTarget).attr('data-name');
                var split = searchString.term.split('\n'),
                last = split[split.length-1].toLowerCase(),
                field = fields.byName[name].term,
                query = {"aggs":{},"from":0,"size":0};
                query.aggs["static_"+field]={"terms":{"field":field,"include":"^"+last+".*","exclude":"^.{1,2}$","size":15}};
        
                searchServer.esQuery('records', query, function(resp) {
                    var list = [];
                    $.each(resp.aggregations['static_' + field]['buckets'], function(index, obj) {
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
                var cont = filter.text.content.split('\n');
                cont.push(ui.item.value);
                filter.text.content = cont.join('\n');
                self.props.changeFilter(filter);                 
            }
        });
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name,
        exists = filter.exists ? 'checked' : '',
        missing = filter.missing ? 'checked' : '';
    
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.props.removeFilter, 'data-remove': name}), 
                React.DOM.label({className: "filter-name"}, name), 
                React.DOM.div({className: "text"}, 
                    React.DOM.textarea({className: "form-control", name: name, 'data-name': name, 
                        placeholder: fields.byName[name].dataterm, 
                        disabled: filter.text.disabled, 
                        onChange: this.textType, 
                        onFocus: this.setAutocomplete, 
                        value: filter.text.content
                    }
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
            filter.range.disabled=true;
        }else{
            filter.exists = false;
            filter.missing = false;
            filter.range.disabled = false;
        }
        this.props.changeFilter(filter);
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name,
        exists = filter.exists ,
        missing = filter.missing ;
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.props.removeFilter, 'data-remove': name}), 
                React.DOM.label({className: "filter-name"}, name), 
                React.DOM.div({className: "dates clearfix pull-right"}, 
                    React.DOM.div({className: "pull-left"}, 
                        "Start:",  
                        React.DOM.input({
                            name: "gte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: filter.range.disabled, 
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
                            disabled: filter.range.disabled, 
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
            filter.range.disabled=true;
        }else{
            filter.exists = false;
            filter.missing = false;
            filter.range.disabled = false;
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
        var name = filter.name,
        exists = filter.exists ,
        missing = filter.missing ;
        return(
            React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.props.removeFilter, 'data-remove': name}), 
                React.DOM.label({className: "filter-name"}, name), 

                React.DOM.div({className: "dates clearfix pull-right"}, 
                    React.DOM.div({className: "pull-left"}, 
                        "Min:",  
                        React.DOM.input({
                            name: "gte", 
                            type: "text", 
                            className: "form-control date", 
                            disabled: filter.range.disabled, 
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
                            disabled: filter.range.disabled, 
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