/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/

'use strict';

var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({
    displayName: 'exports',

    click: function click(e) {
        window.location = "/portal/records/" + this.props.data.uuid;
    },
    render: function render() {
        if (_.has(this.props.data, 'indexTerms')) {
            var title = '',
                info = [];
            //build title
            var index = this.props.data.indexTerms,
                data = this.props.data.data;
            if (_.has(index, 'scientificname')) {
                title = _.capitalize(index['scientificname']);
            } else if (_.has(index, 'genus')) {
                title = _.capitalize(index['genus']);
                if (_.has(index, 'specificepithet')) {
                    title += " " + index['specificepithet'];
                }
            }
            if (_.isEmpty(title)) {
                title = React.createElement(
                    'em',
                    null,
                    'No Name'
                );
            }
            //build info ids,inst
            info = _.without([data['dwc:scientificNameAuthorship']], undefined);

            var link = null;

            if (this.props.includeLink) {
                link = React.createElement(
                    'span',
                    { className: "title-link" },
                    React.createElement(
                        'a',
                        { href: "/portal/records/" + this.props.data.uuid },
                        'view specimen record'
                    )
                );
            }

            return React.createElement(
                'div',
                { id: "title" },
                React.createElement(
                    'h1',
                    { className: "clearfix", onClick: this.click },
                    React.createElement(
                        'span',
                        { className: "title" },
                        React.createElement(
                            'em',
                            null,
                            title
                        ),
                        React.createElement(
                            'span',
                            { className: "title-addition" },
                            info.join(', ')
                        ),
                        link
                    )
                ),
                React.createElement(
                    'h2',
                    null,
                    'From ',
                    React.createElement(
                        'a',
                        { href: '/portal/recordsets/' + this.props.attribution.uuid },
                        this.props.attribution.name
                    )
                )
            );
        } else {

            return React.createElement(
                'div',
                { id: "title" },
                React.createElement(
                    'h1',
                    null,
                    React.createElement(
                        'span',
                        { className: "title" },
                        React.createElement(
                            'em',
                            null,
                            'No Associated Specimen Record'
                        )
                    )
                ),
                React.createElement(
                    'h2',
                    null,
                    'From ',
                    React.createElement(
                        'a',
                        { href: '/portal/recordsets/' + this.props.attribution.uuid },
                        this.props.attribution.name
                    )
                )
            );
        }
    }
});