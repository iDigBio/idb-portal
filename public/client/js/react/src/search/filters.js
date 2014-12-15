/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

module.exports = Filters = React.createClass({
    statics: {
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
        defaultFilters: function(){
            var filters=[],self=this;
            ['Date Collected','Genus','Specific Epithet'].forEach(function(item){
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
                    <TextFilter key={key} filter={filter} removeFilter={this.removeFilter} changeFilter={this.filterPropsChange}/>
                ); 
            case 'daterange':
                return (
                    <DateRangeFilter key={key} filter={filter} removeFilter={this.removeFilter} changeFilter={this.filterPropsChange}/>
                );  
            case 'numericrange':
                return (
                    <NumericRangeFilter key={key} filter={filter} removeFilter={this.removeFilter} changeFilter={this.filterPropsChange}/>
                );  
        }
    },
    resetFilters: function(){
        var self=this;
        //this.setState({filters: self.defaultFilters()},function(){
            self.props.searchChange({
                'filters': Filters.defaultFilters(),
                'image': false,
                'geopoint': false
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
        var cur = this.props.filters;
        cur.unshift(Filters.newFilterProps(event.currentTarget.value));
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
                    var disabled = flist.indexOf(field.name) === -1 ? '' : 'disabled';
                    fltrs.push(
                            <option disabled={disabled} value={field.name} key={field.name}>
                                {field.name}
                            </option>
                    );
                }
            });
            fgroups.push(
              <optgroup key={val} label={fields.groupNames[val]}>
                &nbsp;&nbsp;{fltrs}
              </optgroup>
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
            <div className="section active" id="filters">
                <div className="option-group" id="filter-select">
                    <select className="form-control" value="0" placeholder="select to add" onChange={this.addFilter}>
                        <option value="0" defaultValue className="default">Add a field</option>
                        {fgroups}
                    </select>
                    <a className="btn" onClick={this.clearFilters}>
                        Clear
                    </a>
                    <a className="btn" onClick={this.resetFilters}>
                        Reset
                    </a>
                </div>
                <div id="filters-holder" className="options-holder">
                    <RCTgroup transitionName="filter-trans">
                        {filters}
                    </RCTgroup>
                </div>
                <div id="filter-scroller"  onClick={this.scrollFilters}>
                    <span style={{'display': scrollDisplay }}>
                        &darr; Scroll To Bottom &darr;
                    </span>
                </div>
            </div>
        );
    }
});

var TextFilter = React.createClass({
    componentWillMount: function(){
        var self = this;
        this.debouncedTextType = _.debounce(function(){
            self.props.changeFilter(self.props.filter); 
        },100,{leading: false, trailing: true});
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
            filter.text.disabled=true;
        }else{
            filter.exists = false;
            filter.missing = false;
            filter.text.disabled = false;
        }
        this.props.changeFilter(filter);
    },
    textType: function(event){
        var text = event.currentTarget.value, self=this;
        var filter = this.props.filter;//, filter=filters[ind];   
        filter.text.content = text;
        //this.debouncedTextType();
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
                cont[cont.length-1] = ui.item.value;
                filter.text.content = cont.join('\n');
                self.props.changeFilter(filter);                 
            }
        });
    },
    getSynonyms: function(event){
        event.preventDefault();
        var text = this.props.filter.text.content.split('\n'),self=this;
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
                filter.text.content = output.join('\n');
                self.props.changeFilter(filter);
                //$(event.currentTarget).find('.syn-loader').hide();
                //$(event.currentTarget).removeAttr('disabled');
            });            
        }        
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name,
        exists = filter.exists ? 'checked' : '',
        missing = filter.missing ? 'checked' : '';
        var syn = <span/>,cl='text';
        if(fields.byName[name].synonyms){
            syn=<a onClick={this.getSynonyms}>Add EOL Synonyms</a>;
            cl+=' syn'
        }
        return(
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.props.removeFilter} data-remove={name} title="click to remove this filter"></i>
                <label className="filter-name">{name}</label>
                <div className={cl}>
                {syn}
                    <textarea className="form-control" name={name} data-name={name}
                        placeholder={fields.byName[name].dataterm} 
                        disabled={filter.text.disabled} 
                        onChange={this.textType} 
                        onFocus={this.setAutocomplete}
                        value={filter.text.content}
                    >
                    </textarea>
                    
                </div>
                <div className="presence">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="exists" onChange={this.presenceClick} checked={exists}/>
                            Present
                        </label>
                    </div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="missing" onChange={this.presenceClick} checked={missing}/>
                            Missing
                        </label>
                    </div>
                </div>
            </div>
        )
    }
});

var DateRangeFilter = React.createClass({
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
        missing = filter.missing;
        return(
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.props.removeFilter} data-remove={name}  title="click to remove this filter"></i>
                <label className="filter-name">{name}</label>
                <div className="dates clearfix pull-right">
                    <div className="pull-left">
                        Start: 
                        <input 
                            name="gte"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.dateChange} 
                            onFocus={this.showDatePicker}
                            value={filter.range.gte}
                            placeholder="yyyy-mm-dd"
                        />
                    </div>
                    <div className="pull-left">
                        End: 
                        <input 
                            name="lte"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.dateChange} 
                            onFocus={this.showDatePicker}
                            value={filter.range.lte}
                            placeholder="yyyy-mm-dd"
                        />
                    </div>
                </div>
                <div className="presence">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="exists" onChange={this.presenceClick} checked={exists}/>
                            Present
                        </label>
                    </div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="missing" onChange={this.presenceClick} checked={missing}/>
                            Missing
                        </label>
                    </div>
                </div>
            </div>
        ) 
    }
})

var NumericRangeFilter = React.createClass({
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
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.props.removeFilter} data-remove={name}  title="click to remove this filter"></i>
                <label className="filter-name">{name}</label>

                <div className="dates clearfix pull-right">
                    <div className="pull-left">
                        Min: 
                        <input 
                            name="gte"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.valueChange} 
                            value={filter.range.gte ?  filter.range.gte : ''}
                        />
                    </div>
                    <div className="pull-left">
                        Max: 
                        <input 
                            name="lte"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.valueChange} 
                            value={filter.range.lte ? filter.range.lte : ''}
                        />
                    </div>
                </div>
                <div className="presence">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="exists" onChange={this.presenceClick} checked={exists}/>
                            Present
                        </label>
                    </div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" name={name} value="missing" onChange={this.presenceClick} checked={missing}/>
                            Missing
                        </label>
                    </div>
                </div>
            </div> 
        )
    }
})