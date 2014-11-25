/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    render: function(){

        function formatJSON(json) {
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
        }
        return (
            React.DOM.div({id: "raw", className: "modal fade", tabIndex: "-1", role: "dialog", 'aria-labelledby': "apiModalLabel", 'aria-hidden': "true"}, 
                React.DOM.div({className: "modal-dialog"}, 
                    React.DOM.div({className: "modal-content"}, 
                        React.DOM.div({className: "modal-header"}, 
                            React.DOM.button({type: "button", className: "close", 'data-dismiss': "modal", 'aria-hidden': "true"}, "×"), 
                            React.DOM.h4({id: "apiModalLabel"}, "Raw API Data")
                        ), 
                        React.DOM.div({className: "modal-body"}, 
                            React.DOM.p({id: "raw-body", dangerouslySetInnerHTML: {__html: formatJSON(this.props.data)}}
                            )
                        ), 
                        React.DOM.div({className: "modal-footer"}, 
                            React.DOM.button({className: "btn pull-left", 'data-dismiss': "modal", 'aria-hidden': "true"}, "Close")
                        )
                    )
                )
            ) 
        )
    }
})             

