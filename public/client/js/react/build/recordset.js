
/*
* Recordset View page.
****/
'use strict';

var React = require('react');
var fields = require('../../lib/fields');
var _ = require('lodash');

//var helpers = require('./search/lib/helpers');
//var Map = require('./search/views/mapbox');
//window.queryBuilder = require('./search/lib/querybuilder');

var keys = Object.keys(fields.byDataTerm);
//add terms which aren't in data terms
//keys.push('idigbio:recordId');

var missing = {};
var stotal = 0,
    mtotal = 0;
var formatNum = function formatNum(num) {
    return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

var Total = React.createClass({
    displayName: 'Total',

    render: function render() {
        return React.createElement(
            'span',
            null,
            formatNum(this.props.total)
        );
    }
});

var Fieldrow = React.createClass({
    displayName: 'Fieldrow',

    checkVal: function checkVal(val) {
        if (_.isNaN(val) || val === 'NaN') {
            return '-';
        } else {
            return val;
        }
    },
    render: function render() {
        var style = { 'width': this.props.value - 2 + 'px' };
        var sty2 = { 'width': '170px' };
        return React.createElement(
            'tr',
            null,
            React.createElement(
                'td',
                null,
                React.createElement(
                    'b',
                    null,
                    React.createElement(
                        'a',
                        { href: '/portal/search?rq={"flags":"' + this.props.name + '","recordset":"' + this.props.uuid + '"}' },
                        this.props.name
                    )
                )
            ),
            React.createElement(
                'td',
                { style: sty2, className: "value-column record-count" },
                this.checkVal(this.props.total)
            ),
            React.createElement(
                'td',
                { className: "value-column" },
                React.createElement(
                    'div',
                    { className: "perc-box" },
                    React.createElement('span', { className: "perc-bar", style: style }),
                    React.createElement(
                        'span',
                        { className: "perc-text" },
                        this.checkVal(this.props.value)
                    )
                )
            )
        );
    }
});

var FieldsTable = React.createClass({
    displayName: 'FieldsTable',

    render: function render() {
        var self = this;
        var flagrows = _.map(Object.keys(this.props.flags), function (flag) {
            var perc = Number((100 / self.props.stotal * self.props.flags[flag].itemCount).toFixed(3));
            return React.createElement(Fieldrow, { key: flag, name: flag, total: self.props.flags[flag].itemCount, value: perc, uuid: self.props.uuid });
        });
        var sty = { 'textAlign': 'center' };
        return React.createElement(
            'div',
            { id: "fields-table", style: { display: this.props.active ? 'block' : 'none' }, className: "stat-table clearfix" },
            React.createElement(
                'div',
                { className: "blurb" },
                'This table shows any data corrections that were performed on this recordset to improve the capabilities of iDigBio ',
                React.createElement(
                    'a',
                    { href: "/portal/search" },
                    'Search'
                ),
                '. The first column represents the correction performed. The last two columns represent the number and percentage of records that were corrected. A complete list of the data quality flags and their descriptions can be found ',
                React.createElement(
                    'a',
                    { alt: "flag descriptions", href: "https://github.com/iDigBio/idigbio-search-api/wiki/Data-Quality-Flags" },
                    'here'
                ),
                '. Clicking on a data flag name will take you to a search for all records with this flag in this recordset.'
            ),
            React.createElement(
                'table',
                { className: "table table-condensed pull-left tablesorter-blue", id: "table-fields" },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'Flag'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Records With This Flag'
                        ),
                        React.createElement(
                            'th',
                            { style: sty },
                            '(%) Percent With This Flag'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    flagrows
                )
            )
        );
    }
});

var UseTable = React.createClass({
    displayName: 'UseTable',

    render: function render() {
        var rows = [],
            uuid = this.props.uuid;
        _.each(this.props.use.dates, function (val, key) {
            var r = val[uuid];

            var date = key.substring(5, 7) + ' / ' + key.substring(0, 4);

            rows.push(React.createElement(
                'tr',
                { key: key },
                React.createElement(
                    'td',
                    null,
                    date
                ),
                React.createElement(
                    'td',
                    { className: "value" },
                    formatNum(r.search)
                ),
                React.createElement(
                    'td',
                    { className: "value" },
                    formatNum(r.download)
                ),
                React.createElement(
                    'td',
                    { className: "value" },
                    formatNum(r.seen)
                ),
                React.createElement(
                    'td',
                    { className: "value" },
                    formatNum(r.viewed_records)
                ),
                React.createElement(
                    'td',
                    { className: "value" },
                    formatNum(r.viewed_media)
                )
            ));
        });

        return React.createElement(
            'div',
            { id: "use-table", style: { display: this.props.active ? 'block' : 'none' }, className: "stat-table clearfix" },
            React.createElement(
                'div',
                { className: "clearfix" },
                'The table below represents monthly iDigBio portal use statistics for this recordset. ',
                React.createElement(
                    'em',
                    null,
                    React.createElement(
                        'b',
                        null,
                        'Search'
                    )
                ),
                ' indicates in how many instances a record from this recordset matched a search query. ',
                React.createElement(
                    'em',
                    null,
                    React.createElement(
                        'b',
                        null,
                        'Download'
                    )
                ),
                ' indicates in how many instances a record from this recordset was downloaded. ',
                React.createElement(
                    'em',
                    null,
                    React.createElement(
                        'b',
                        null,
                        'Seen'
                    )
                ),
                ' indicates in how many instances a record from this recordset appeared (visually) in the search results in a browser window.  ',
                React.createElement(
                    'em',
                    null,
                    React.createElement(
                        'b',
                        null,
                        'Records Viewed'
                    )
                ),
                ' and ',
                React.createElement(
                    'em',
                    null,
                    React.createElement(
                        'b',
                        null,
                        'Media Viewed'
                    )
                ),
                ' indicate how many specimen and media records were opened and viewed in full detail. Note: Monthly statistics aggregation began on Jan 15th 2015; therefore, the month of (01 / 2015) represents approximately half a month of statistics reporting.'
            ),
            React.createElement(
                'table',
                { className: "table table-condensed pull-left tablesorter-blue", id: "table-use" },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'Month of'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Search'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Download'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Seen'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Records Viewed'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Media Viewed'
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    rows
                )
            )
        );
    }
});

var RawView = React.createClass({
    displayName: 'RawView',

    formatJSON: function formatJSON(json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },
    render: function render() {

        return React.createElement(
            'div',
            { id: "raw", style: { display: this.props.active ? 'block' : 'none' }, className: "stat-table clearfix" },
            React.createElement('p', { id: "raw-body", dangerouslySetInnerHTML: { __html: this.formatJSON(this.props.raw) } })
        );
    }
});

var StatsTables = React.createClass({
    displayName: 'StatsTables',

    click: function click(e) {
        e.preventDefault();
        this.setState({ active: e.currentTarget.attributes['data-active'].value });
    },
    getInitialState: function getInitialState() {
        return { active: 'flags' };
    },
    render: function render() {
        return React.createElement(
            'div',
            { id: "stats-tables", className: "clearfix scrollspy" },
            React.createElement(
                'ul',
                { id: "stats-tabs" },
                React.createElement(
                    'li',
                    { className: this.state.active == 'flags' ? 'active' : '', id: "corrected-tab", onClick: this.click, 'data-active': "flags" },
                    'Data Corrected'
                ),
                React.createElement(
                    'li',
                    { className: this.state.active == 'use' ? 'active' : '', id: "use-tab", onClick: this.click, 'data-active': "use" },
                    'Data Use'
                ),
                React.createElement(
                    'li',
                    { className: this.state.active == 'raw' ? 'active' : '', id: "raw-tab", onClick: this.click, 'data-active': "raw" },
                    'Raw'
                )
            ),
            React.createElement(FieldsTable, { active: this.state.active == 'flags', flags: this.props.flags, stotal: this.props.stotal, uuid: this.props.uuid }),
            React.createElement(UseTable, { active: this.state.active == 'use', use: this.props.use, uuid: this.props.uuid }),
            React.createElement(RawView, { active: this.state.active == 'raw', raw: this.props.raw })
        );
    }
});

var Title = React.createClass({
    displayName: 'Title',

    render: function render() {
        return React.createElement(
            'h1',
            { id: "title" },
            this.props.keyid
        );
    }
});

var Description = React.createClass({
    displayName: 'Description',

    render: function render() {
        var logo = '';
        if (_.has(this.props.data, 'logo_url') && !_.isEmpty(this.props.data.logo_url)) {
            logo = React.createElement('img', { className: "logo", src: this.props.data.logo_url });
        }
        //decode html characters that appear in some descriptions
        var desc = _.unescape(this.props.data.collection_description);
        return React.createElement(
            'div',
            { id: "description", className: "scrollspy" },
            React.createElement(
                'p',
                { className: "clearfix" },
                logo,
                React.createElement(
                    'span',
                    null,
                    desc
                )
            )
        );
    }
});

var Last = React.createClass({
    displayName: 'Last',

    render: function render() {
        return React.createElement(
            'span',
            null,
            this.props.keyid
        );
    }
});

var Contacts = require('./shared/contacts');

var Raw = require('./shared/raw');

module.exports = React.createClass({
    displayName: 'exports',

    navList: function navList() {

        //var map = this.props.record.indexTerms.geopoint ?  <li><a href="#map">Map</a></li> : null;
        //var media = this.props.record.indexTerms.hasImage ? <li><a href="#media">Media</a></li> : null;

        return React.createElement(
            'ul',
            { id: "side-nav-list" },
            React.createElement(
                'li',
                { className: "title" },
                'Contents'
            ),
            React.createElement(
                'li',
                null,
                React.createElement(
                    'a',
                    { href: "#description" },
                    'Description'
                )
            ),
            React.createElement(
                'li',
                null,
                React.createElement(
                    'a',
                    { href: "#contacts" },
                    'Contacts'
                )
            ),
            React.createElement(
                'li',
                null,
                React.createElement(
                    'a',
                    { href: "#stats-tables" },
                    'All Data'
                )
            )
        );
    },
    render: function render() {
        var raw = this.props.recordset;
        var data = raw.data;
        var id = raw.uuid;
        var last = data.update.substring(0, 10);
        var search = '/portal/search?rq={"recordset":"' + id + '"}';
        var web = null;

        if (_.has(raw.data, 'institution_web_address' && !_.isEmpty(raw.data.institution_web_address))) {
            web = React.createElement(
                'div',
                null,
                React.createElement(
                    'h2',
                    { className: "title" },
                    'Collection Home Page'
                ),
                React.createElement(
                    'a',
                    { href: raw.data.institution_web_address },
                    raw.data.institution_web_address
                )
            );
        }

        var counts = React.createElement(
            'div',
            null,
            React.createElement(
                'span',
                { className: "info" },
                'Specimen Records: ',
                React.createElement(Total, { key: 'Specimen', keyid: 'Specimen', total: formatNum(this.props.stotal) })
            ),
            React.createElement(
                'span',
                { className: "info" },
                'Media Records: ',
                React.createElement(Total, { key: 'Media', keyid: 'Media', total: formatNum(this.props.mtotal) })
            ),
            React.createElement(
                'span',
                { className: "info" },
                'Last Update: ',
                React.createElement(Last, { key: last, keyid: last })
            )
        );

        return React.createElement(
            'div',
            { className: "container-fluid" },
            React.createElement(
                'div',
                { className: "row" },
                React.createElement(
                    'div',
                    { id: "content", className: "col-lg-7 col-lg-offset-2 col-md-10 col-sm-10" },
                    React.createElement(
                        'h1',
                        { id: "banner", className: "pull-left" },
                        'Recordset'
                    ),
                    React.createElement(
                        'a',
                        { id: "search-button", className: "pull-right", href: search },
                        'Search Recordset'
                    ),
                    React.createElement(Title, { key: data.collection_name, keyid: data.collection_name }),
                    counts,
                    React.createElement(Description, { data: data }),
                    web,
                    React.createElement(Contacts, { data: data }),
                    React.createElement(StatsTables, { uuid: raw.uuid, raw: raw, use: this.props.use, flags: this.props.flags, stotal: this.props.stotal })
                ),
                React.createElement(
                    'div',
                    { className: "col-lg-2 col-md-2 col-sm-2" },
                    React.createElement(
                        'div',
                        { id: "side-nav" },
                        this.navList()
                    )
                )
            )
        );
    }
});