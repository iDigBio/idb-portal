import React, {useEffect, useState, useCallback} from "react";
import idbapi from '../../../lib/idbapi';
import { AutoComplete, Input } from 'antd';
const { TextArea } = Input;
export function newFilterProps(term){
    const type = fields.byTerm[term].type;
    switch (type) {
        case 'text':
            return { name: term, type: type, text: '', exists: false, missing: false, fuzzy: false };
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
const Filters = ({filters, search, searchChange, active, aggs}) => {

    function filterPropsChange(filterObj){
        const list = filters.map(item => item.name);
        const updatedFilters = [...filters];
        updatedFilters[list.indexOf(filterObj.name)] = filterObj;
        searchChange('filters', updatedFilters);
    }

    function makeFilter(filter) {
        switch (filter.type) {
            case 'text':
                return <TextFilter key={filter.name} filter={filter} removeFilter={removeFilter} search={search} changeFilter={filterPropsChange} aggs={aggs} />;
            case 'daterange':
                return <DateRangeFilter key={filter.name} filter={filter} removeFilter={removeFilter} changeFilter={filterPropsChange} />;
            case 'numericrange':
                return <NumericRangeFilter key={filter.name} filter={filter} removeFilter={removeFilter} changeFilter={filterPropsChange} />;
            default:
                return null;
        }
    }

    function clearFilters(e){
        e.preventDefault();
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
                <select className="form-control" value="0" placeholder="select to add" onChange={addFilter} aria-label="Add a field">
                    <option value="0" defaultValue className="default">Add a field</option>
                    {fgroups}
                </select>
                <a href="#" role="button" className="btn" onClick={clearFilters} title="Clear all filter inputs" style={{fontSize: '14px', color: '#0088cc'}}>
                    Clear
                </a>
            </div>
            <div id="filters-holder" className="options-holder">
                {filtersElements}
            </div>
            <button type="button" id="filter-scroller" onClick={scrollFilters} style={{ 'display': scrollDisplay, background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0, font: 'inherit', color: 'inherit' }} aria-label="Scroll filters to bottom">
                &darr; Scroll To Bottom &darr;
            </button>
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

const TextFilter = ({ filter, changeFilter, removeFilter, search, aggs }) => {
    const [text, setText] = useState(filter.text);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState([]);

    useEffect(() => {
        const label = renderTitle('Suggestions');
        const options = aggs.map((agg) => {
            return renderItem(agg.doc_count.toString(), agg.key);
        });
        setDropdownOptions([{ label, options }]);
    }, [aggs]);

    useEffect(() => {
        setText(filter.text);
    }, [filter.text]);

    // const debouncedTextType = _.debounce((param) => {
    //     changeFilter(param);
    // }, 300, { leading: false, trailing: true });

    const debounce = (param) => {
        debouncedTextType(param);
    };

    const presenceClick = (event) => {
        const localFilter = { ...filter };
        switch (event.currentTarget.value) {
            case 'exists':
                localFilter.exists = !localFilter.exists;
                localFilter.missing = false;
                localFilter.fuzzy = false;
                break;
            case 'missing':
                localFilter.exists = false;
                localFilter.missing = !localFilter.missing;
                localFilter.fuzzy = false;
                break;
            case 'fuzzy':
                localFilter.fuzzy = !localFilter.fuzzy;
                localFilter.exists = false;
                localFilter.missing = false;
                break;
            default:
                localFilter.exists = false;
                localFilter.missing = false;
                localFilter.fuzzy = false;
        }
        changeFilter(localFilter);
    };

    const debouncedTextType = useCallback(
        _.debounce((localFilter) => {
            changeFilter(localFilter);
        }, 200, { leading: false, trailing: true }),
        [search]
    );

    const textType = (e) => {
        const value = e.target.value;
        setText(value);
        setDropdownOpen(value !== '');

        const localFilter = { ...filter, text: value };
        debouncedTextType(localFilter);
    };

    // const textType = (e) => {
    //     const value = e.target.value;
    //     setDropdownOpen(value !== '');
    //     const localFilter = { ...filter, text: value };
    //     setText(value);
    //     debounce(localFilter);
    // };

    const handleBlur = () => {
        setDropdownOpen(false);
    };

    const handleEnter = (e) => {
        if (!dropdownOpen) {
            setDropdownOpen(false);
        } else {
            console.log('inside')
            e.preventDefault();
            setDropdownOpen(false);
        }
    };

    // const handleSelect = (e) => {
    //     e.preventDefault();
    //     textType({ target: { value: e.target.innerText } });
    //     setDropdownOpen(false);
    // };

    const handleSelect = (e) => { // fires when a user selects an option from the dropdown
        // e.preventDefault()
        // textType(e)
        // setDropdownOpen(false)
        const lastNewlineIndex = text.lastIndexOf('\n');

        let trimmedText;
        if (lastNewlineIndex === -1) {
            // No newline character found, trim the whole text
            trimmedText = ''
        } else {
            // Trim the content after the last newline
            const beforeLastNewline = text.substring(0, lastNewlineIndex + 1);
            const afterLastNewline = text.substring(lastNewlineIndex + 1).trim();
            trimmedText = beforeLastNewline
        }
        const newText = trimmedText + e + '\n'
        console.log(newText)
        setText(newText);
        setDropdownOpen(false);

        const localFilter = { ...filter, text: newText };
        debouncedTextType(localFilter);
    }

    const renderItem = (count, name) => ({
        value: name,
        label: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {name}
                <span>{count}</span>
            </div>
        ),
    });

    const renderTitle = (title) => (
        <span>
            {title}
            <a
                style={{ float: 'right' }}
                href="https://idigbio.github.io/docs/portal/suggestions/"
                target="_blank"
                rel="noopener noreferrer"
            >
                How is this list populated?
            </a>
        </span>
    );

    const localFilter = filter;
    const name = localFilter.name;
    const label = fields.byTerm[name].name;
    const textval = localFilter.exists || localFilter.missing ? fields.byTerm[name].dataterm : text;

    return (
        <div className="option-group filter" id={`${name}-filter`} key={name}>
            <a href="#" role="button" className="remove btn-link-style" onClick={removeFilter} data-remove={name} title="click to remove this filter" aria-label={`Remove ${label} filter`}>
                <i className="glyphicon glyphicon-remove"></i>
            </a>
            <label className="filter-name">{label}</label>
            <div className="text">
                {filter.name === 'scientificname' ? (
                    <AutoComplete
                        options={dropdownOptions}
                        popupMatchSelectWidth={false}
                        dropdownStyle={{ width: 400 }}
                        onSelect={(e) => handleSelect(e)}
                        onBlur={() => handleBlur()}
                        onFocus={() => setDropdownOpen(text !== '')}
                        open={filter.fuzzy && dropdownOpen}
                        disabled={localFilter.exists || localFilter.missing}
                        value={textval}
                    >
                        <TextArea
                            className="form-control"
                            name={name}
                            data-name={name}
                            placeholder={fields.byTerm[name].dataterm}
                            disabled={localFilter.exists || localFilter.missing}
                            onChange={textType}
                            onPressEnter={handleEnter}
                            spellCheck={false}
                        />
                    </AutoComplete>
                ) : (
                    <AutoComplete
                        value={textval}
                    >
                        <TextArea
                            className="form-control"
                            name={name}
                            data-name={name}
                            placeholder={fields.byTerm[name].dataterm}
                            disabled={localFilter.exists || localFilter.missing}
                            onChange={(e) => textType(e)}
                            onFocus={() => setAutocomplete(e)}
                            value={textval}
                            spellCheck={false}
                        />
                    </AutoComplete>
                )}
            </div>
            <div className="presence">
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="exists" onChange={presenceClick} checked={localFilter.exists} />
                        Present
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name={name} value="missing" onChange={presenceClick} checked={localFilter.missing} />
                        Missing
                    </label>
                </div>
                <div className="checkbox" style={{ display: filter.name !== 'scientificname' ? 'none' : 'flex' }}>
                    <label>
                        <input type="checkbox" name={name} value="fuzzy" onChange={presenceClick} checked={filter.name !== 'scientificname' ? false : localFilter.fuzzy} />
                        Fuzzy
                    </label>
                </div>
            </div>
        </div>
    );
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
            <a href="#" role="button" className="remove btn-link-style" onClick={removeFilter} data-remove={name} title="click to remove this filter" aria-label={`Remove ${label} filter`}>
                <i className="glyphicon glyphicon-remove"></i>
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
                        aria-label={`${label} start date`}
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
                        aria-label={`${label} end date`}
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
            <a href="#" role="button" className="remove btn-link-style" onClick={removeFilter} data-remove={name} title="click to remove this filter" aria-label={`Remove ${label} filter`}>
                <i className="glyphicon glyphicon-remove"></i>
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
                        aria-label={`${label} minimum value`}
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
                        aria-label={`${label} maximum value`}
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