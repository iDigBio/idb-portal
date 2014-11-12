/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');

module.exports = React.createClass({
    filterStateChange: function(filterObj){
        var list = this.filters();
        var filters = this.state.filters;
        filters[list.indexOf(filterObj.name)] = filterObj;
        this.setState({filters: filters});
        this.props.searchChange('filters',this.state.filters);
    },
    newFilterState: function(name){
        var type = fields.byName[name].type;
        switch(type){
            case 'text':
                return {name: name, type: type, text:{content:'', disabled: false}, exists: false, missing: false};
            case 'daterange':
                return {name: name, type: type, range:{start: '', end: '', disabled: false}, exists: false, missing: false};
        }
    },
    getInitialState: function(){
        var filters=[],self=this;
        ['Date Collected','Kingdom','Phylum'].forEach(function(item){
            filters.push(self.newFilterState(item));
        });
        return {filters: filters};
    },
    addFilter: function(event){
        //var flist = this.filters();
        var cur = this.state.filters;
        cur.unshift(this.newFilterState(event.currentTarget.value));
        this.setState({filters: cur});
    },
    removeFilter: function(name){
        var cur = this.state.filters, filters=this.filters();
        cur.splice(filters.indexOf(name),1);
        this.setState({filters: cur});
        this.props.searchChange('filters',this.state.filters);
    },
    filters: function(){
        var list = [];
        
        _.each(this.state.filters,function(item){
            list.push(item.name);
        });
        return list;
    },
    makeFilter: function(filter){
        //var type = fltrObj.type, name = fltrObj.name;
        //var type = 'text';
        switch(filter.type){
            case 'text':
                return(
                    <TextFilter filter={filter} removeFilter={this.removeFilter} changeFilter={this.filterStateChange}/>
                ); 
            case 'daterange':
                return (<DateRangeFilter filter={filter} removeFilter={this.removeFilter} changeFilter={this.filterStateChange}/>);    
        }
    },

    render: function(){
        var self=this;
       
        var fgroups =[];
        var groups = ['taxonomy','specimen','collectionevent','locality','paleocontext'];
        var flist = self.filters();
        //filter select list 
        _.each(groups,function(val){
            var fltrs = [];
            _.each(fields.byGroup[val],function(field){
                if(field.hidden===1){
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
              <optgroup label={fields.groupNames[val]}>
                &nbsp;&nbsp;{fltrs}
              </optgroup>
            );
        });
        //filters
        var filters = [];
        _.each(this.state.filters,function(item){
            filters.push(
                self.makeFilter(item)
            )
        })
        return (
            <div>
                <div className="option-group" id="filter-select">
                    <select className="form-control" value="0" placeholder="select to add" onChange={this.addFilter}>
                        <option value="0" defaultValue>Add a field filter</option>
                        {fgroups}
                    </select>
                </div>
                <div id="filters-holder" className="options-holder">
                    {filters}
                </div>
            </div>
        );
    }
});

var TextFilter = React.createClass({
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
            close: function(event,ui){
                var filter = self.props.filter;//, filter=filters[ind];   
                filter.text.content = event.currentTarget.value;
                self.props.changeFilter(filter);                 
            }
        });
    },
    propClick: function(event){
        this.props.removeFilter(event.currentTarget.attributes['data-remove'].value);
    },
    render: function(){
        var filter = this.props.filter;
        var name = filter.name,
        exists = filter.exists ? 'checked' : '',
        missing = filter.missing ? 'checked' : '';
    
        return(
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.propClick} data-remove={name}></i>
                <label className="filter-name">{name}</label>
                <div className="text">
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
    propClick: function(event){
        this.props.removeFilter(event.currentTarget.attributes['data-remove'].value);
    },
    dateChange: function(event){
        var date = event.currentTarget.value;
        var filter = this.props.filter;//, filter=filters[ind];   
        filter.range[event.currentTarget.name] = date;
        this.props.changeFilter(filter);     
    },
    showDatePicker: function(event){
        var d = new Date(),self=this;
        $(event.currentTarget).datepicker({
            dateFormat: 'yy-mm-dd',
            yearRange: '1701:'+d.getFullYear(),
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
        exists = filter.exists ? 'checked' : '',
        missing = filter.missing ? 'checked' : '';
        return(
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.propClick} data-remove={name}></i>
                <label className="filter-name">{name}</label>
                <div className="dates clearfix">
                    <div className="pull-right">
                        End: 
                        <input 
                            name="end"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.dateChange} 
                            onFocus={this.showDatePicker}
                            value={filter.range.end}
                            placeholder="yyyy-mm-dd"
                        />
                    </div>
                    <div className="pull-right">
                        Start: 
                        <input 
                            name="start"
                            type="text" 
                            className="form-control date"
                            disabled={filter.range.disabled} 
                            onChange={this.dateChange} 
                            onFocus={this.showDatePicker}
                            value={filter.range.start}
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