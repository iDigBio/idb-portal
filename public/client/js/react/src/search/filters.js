import React, {useEffect, useState} from "react";
import idbapi from '../../../lib/idbapi';

export function newFilterProps(term){
    const type = fields.byTerm[term].type;
    switch (type) {
        case 'text':
            return { name: term, type: type, text: '', exists: false, missing: false };
        case 'daterange':
            return { name: term, type: type, range: { gte: '', lte: '' }, exists: false, missing: false };
        case 'numericrange':
            return { name: term, type: type, range: { gte: false, lte: false }, exists: false, missing: false };
        default:
            return null;
    }
};

export function defaultFilters() {
    let filters = [];
    ['scientificname', 'datecollected', 'country'].forEach(item => {
        filters.push(newFilterProps(item));
    });
    return filters;
}
const Filters = ({filters, search, searchChange, active}) => {

    function filterPropsChange(filterObj){
        const list = filters.map(item => item.name);
        const updatedFilters = [...filters];
        updatedFilters[list.indexOf(filterObj.name)] = filterObj;
        searchChange('filters', updatedFilters);
    }

    function makeFilter(filter) {
        switch (filter.type) {
            case 'text':
                return <TextFilter key={filter.name} filter={filter} removeFilter={removeFilter} search={search} changeFilter={filterPropsChange} />;
            case 'daterange':
                return <DateRangeFilter key={filter.name} filter={filter} removeFilter={removeFilter} changeFilter={filterPropsChange} />;
            case 'numericrange':
                return <NumericRangeFilter key={filter.name} filter={filter} removeFilter={removeFilter} changeFilter={filterPropsChange} />;
            default:
                return null;
        }
    }

    function clearFilters(){
        const updatedFilters = filters.map(item => newFilterProps(item.name));
        searchChange({ 'filters': updatedFilters });
    }

    function addFilter(event){
        event.preventDefault();
        const updatedFilters = [newFilterProps(event.currentTarget.value), ...filters];
        searchChange('filters', updatedFilters);
    }

    function removeFilter(event){
        event.preventDefault();
        const term = event.currentTarget.getAttribute('data-remove');
        const updatedFilters = filters.filter(item => item.name !== term);
        searchChange('filters', updatedFilters);
    }

    function getFilters(){
        var list = [];

        _.each(filters,function(item){
            list.push(item.name);
        });
        return list;
    }

    function scrollFilters() {
        $('#filters-holder').animate({
            scrollTop: $('#filters-holder').height()
        });
    };

    const flist = getFilters()
    const fgroups = []
    _.each(fields.searchGroups,function(val){
        var fltrs = [];
        _.each(fields.byGroup[val],function(field){
            if(field.hidden){
                //noop
            }else{
                var disabled = flist.indexOf(field.term) === -1 ? '' : 'disabled';
                fltrs.push(
                    <option disabled={disabled} value={field.term} key={field.term}>
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

    var filtersElements = _.map(filters,function(item){
        return makeFilter(item)
    })

    var scrollDisplay = 'none';
    if(filters.length>3){
        scrollDisplay='block';
    }

    return (
        <div className={`section ${active}`} id="filters">
            <div className="option-group" id="filter-select">
                <select className="form-control" value="0" placeholder="select to add" onChange={addFilter}>
                    <option value="0" defaultValue className="default">Add a field</option>
                    {fgroups}
                </select>
                <a className="btn" onClick={clearFilters} title="Clear all filter inputs">
                    Clear
                </a>
            </div>
            <div id="filters-holder" className="options-holder">
                {filtersElements}
            </div>
            <div id="filter-scroller" onClick={scrollFilters}>
                <span style={{ 'display': scrollDisplay }}>
                    &darr; Scroll To Bottom &darr;
                </span>
            </div>
        </div>
    );
};

//custom autocomplete for add all feature
$.widget("custom.IDBAutocomplete", $.ui.autocomplete, {
    _renderItem: function(ul, item){
        var link = $('<a>').attr('href','#').addClass('item').append(item.label);
        var addall = $('<a>').attr('href','#').addClass('all').append('add all')
        return $( "<li>" ).addClass('item-wrapper').append(link).append(addall).appendTo( ul );
    }
})

const TextFilter = ({filter, changeFilter, removeFilter, search}) => {
    const [text, setText] = useState(filter.text)

    useEffect(() => {
        debounce(filter)
    }, []);

    useEffect(() => {
        setText(filter.text)
    }, [filter.text]);

    const debouncedTextType = _.debounce(function(param){
        changeFilter(param);
    },700,{leading: false, trailing: true});

    function debounce(param) {
        debouncedTextType(param)
    }

    function presenceClick(event){
        var localFilter = filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                localFilter.exists = true;
                localFilter.missing = false;
            }else if(event.currentTarget.value=='missing'){
                localFilter.exists = false;
                localFilter.missing = true;
            }
        }else{
            localFilter.exists = false;
            localFilter.missing = false;
        }
        changeFilter(localFilter);
    }
    function textType(event){
        var localText = event.currentTarget.value
        var localFilter = filter;//, filter=filters[ind];
        localFilter.text = localText;
        setText(localText)
        debounce(localFilter)
    }

    function setAutocomplete(event){
        // var self=this.name;
        var options = {
            source: function(searchString, respCallback) {
                name = this.element[0].name;//$(event.currentTarget).attr('data-name');
                var split = searchString.term.split('\n'),
                last = split[split.length-1].toLowerCase(),
                rq = queryBuilder.buildQueryShim(search);
                rq[name]={'type':'prefix', 'value': last};
                var query = {rq: rq, count: 15, top_fields:[name]};

                idbapi.summary('top/basic/',query, function(resp) {
                    respCallback(_.map(resp[name], function(v,k){
                        return k;
                    }).sort());
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
                var localFilter = filter;//, filter=filters[ind];
                var cont = localFilter.text.split('\n');
                cont.pop();
                //cont[cont.length-1] = ui.item.label;
                var mozilla;
                if(!_.isUndefined(event.toElement) && event.toElement.classList.contains('all')){
                    //|| (!_.isUndefined(event.originalEvent.originalEvent.originalEvent.originalTarget.classList) && event.originalEvent.originalEvent.originalEvent.originalTarget.classList.contains('all'))){
                    var rq = queryBuilder.buildQueryShim(search);
                    rq[name]={'type':'prefix', 'value': ui.item.label.trim()+' '};
                    var query = {rq: rq, count: 300, top_fields:[name]};
                    cont.push(ui.item.label);
                    idbapi.summary('top/basic/',query, function(resp) {
                        _.each(resp[name], function(v,k){
                            cont.push(k);
                        })
                        localFilter.text = cont.join('\n');
                        changeFilter(localFilter);
                    })
                }else{
                    cont.push(ui.item.label);
                    localFilter.text = cont.join('\n');
                    changeFilter(localFilter);
                }
            }
        }
    }

    function getSynonyms(event){
        event.preventDefault();
        var localText = filter.text.split('\n'),self=this;
        //dont run search for blank text
        if(!_.isEmpty(localText[0].trim())){
            //$(event.currentTarget).attr('disabled','disabled');
            //$(event.currentTarget).find('.syn-loader').show();
            var output = [];
            async.each(localText,function(item,callback){
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
                                            if(localText.indexOf(syn)=== -1){
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
                var localFilter = filter;
                localFilter.text = output.join('\n');
                changeFilter(localFilter);
            });            
        }        
    }

    var localFilter = filter,disabled=false,textval;
    var name = localFilter.name, label = fields.byTerm[name].name;
    var syn = <span/>,cl='text';
    if(fields.byTerm[name].synonyms){
        syn=<a onClick={getSynonyms}>Add EOL Synonyms</a>;
        cl+=' syn'
    }
    if(localFilter.exists || localFilter.missing){
        disabled=true;
        textval=fields.byTerm[name].dataterm;
    }else{
        textval=text;
    }
    return(
        <div className="option-group filter" id={name+'-filter'} key={name}>
            <a className="remove" href="#" onClick={removeFilter} data-remove={name}>
                <i className="glyphicon glyphicon-remove"  title="click to remove this filter"></i>
            </a>
            <label className="filter-name">{label}</label>
            <div className={cl}>
            {syn}
                <textarea className="form-control" name={name} data-name={name}
                    placeholder={fields.byTerm[name].dataterm}
                    disabled={disabled}
                    onChange={textType}
                    onFocus={setAutocomplete}
                    value={textval}
                >
                </textarea>

            </div>
            <div className="presence">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="exists" onChange={presenceClick} checked={localFilter.exists}/>
                        Present
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="missing" onChange={presenceClick} checked={localFilter.missing}/>
                        Missing
                    </label>
                </div>
            </div>
        </div>
    )

};

const DateRangeFilter = ({filter, changeFilter, removeFilter}) => {

    function dateChange(event){
        var date = event.currentTarget.value;
        var localFilter = filter;//, filter=filters[ind];
        localFilter.range[event.currentTarget.name] = date;
        changeFilter(localFilter);
    }

    function presenceClick(event){
        var localFilter = filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                localFilter.exists = true;
                localFilter.missing = false;
            }else if(event.currentTarget.value=='missing'){
                localFilter.exists = false;
                localFilter.missing = true;
            }
        }else{
            localFilter.exists = false;
            localFilter.missing = false;
        }
        changeFilter(localFilter);
    }

    var localFilter = filter;
    var name = filter.name;
    var label = fields.byTerm[name].name;
    var exists = filter.exists;
    var missing = filter.missing;
    var disabled = false;
    if(exists || missing){
        disabled=true;
    }
    return(
        <div className="option-group filter" id={name+'-filter'} key={name}>
            <a className="remove" href="#" onClick={removeFilter} data-remove={name}>
                <i className="glyphicon glyphicon-remove"   title="click to remove this filter"></i>
            </a>
            <label className="filter-name">{label}</label>
            <div className="dates clearfix pull-right">
                <div className="pull-left">
                    Start:
                    <input
                        name="gte"
                        type="text"
                        className="form-control date"
                        disabled={disabled}
                        onChange={dateChange}
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
                        disabled={disabled}
                        onChange={dateChange}
                        value={filter.range.lte}
                        placeholder="yyyy-mm-dd"
                    />
                </div>
            </div>
            <div className="presence">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="exists" onChange={presenceClick} checked={exists}/>
                        Present
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="missing" onChange={presenceClick} checked={missing}/>
                        Missing
                    </label>
                </div>
            </div>
        </div>
    )

}

const NumericRangeFilter = ({filter, changeFilter, removeFilter}) => {

    function presenceClick(event){
        var localFilter = filter;
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                localFilter.exists = true;
                localFilter.missing = false;
            }else if(event.currentTarget.value=='missing'){
                localFilter.exists = false;
                localFilter.missing = true;
            }
        }else{
            localFilter.exists = false;
            localFilter.missing = false;
        }
        changeFilter(localFilter);
    }
    function valueChange(event){
        var localFilter = filter;
        var val = event.target.value;
        if(_.isEmpty(val) || !_.isFinite(parseInt(val))){
            val = false;
        }
        localFilter.range[event.currentTarget.name] = parseInt(val);
        changeFilter(localFilter);
    }

    var localFilter = filter;
    var name = filter.name;
    var label = fields.byTerm[name].name;
    var exists = filter.exists;
    var missing = filter.missing;
    var disabled = false;
    if(exists || missing){
        disabled=true;
    }
    return(
        <div className="option-group filter" id={name+'-filter'} key={name}>
            <a className="remove" href="#" onClick={removeFilter} data-remove={name}>
                <i className="glyphicon glyphicon-remove"  title="click to remove this filter"></i>
            </a>
            <label className="filter-name">{label}</label>

            <div className="dates clearfix pull-right">
                <div className="pull-left">
                    Min:
                    <input
                        name="gte"
                        type="text"
                        className="form-control date"
                        disabled={disabled}
                        onChange={valueChange}
                        value={filter.range.gte ?  filter.range.gte : ''}
                        placeholder={fields.byTerm[name].dataterm}
                    />
                </div>
                <div className="pull-left">
                    Max:
                    <input
                        name="lte"
                        type="text"
                        className="form-control date"
                        disabled={disabled}
                        onChange={valueChange}
                        value={filter.range.lte ? filter.range.lte : ''}
                        placeholder={fields.byTerm[name].dataterm}
                    />
                </div>
            </div>
            <div className="presence">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="exists" onChange={presenceClick} checked={exists}/>
                        Present
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="missing" onChange={presenceClick} checked={missing}/>
                        Missing
                    </label>
                </div>
            </div>
        </div>
    )

}

export default Filters;