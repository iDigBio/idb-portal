/**
 * @jsx React.DOM
 */
var React = require('react');
var _ = require('underscore');

module.exports = React.createClass({displayName: 'exports',
    noLogo: function(event){
        $(event.currentTarget).remove();
    },
    check: function (val, prefix, postfix) {
        var acc = [];
        if(_.isArray(val)){
            _.each(val,function(v){
                if(_.isString(v) && !_.isEmpty(v)) {
                    acc.push(v);
                }
            });
            if(_.isString(prefix)){
                val = acc.join(prefix);
            }else{
                val = acc.join(' ');                
            }
        }else if(_.isNumber(val)){
            val = val.toString();
        }else{
            if(_.isUndefined(val) || _.isEmpty(val)){
                val = '';
            }
        }
        if(!_.isEmpty(val) && _.isString(prefix)){
            val = prefix + val;
        }
        if(!_.isEmpty(val) && _.isString(postfix)){
            val = val + postfix;
        } 
        return val;
    },
    render: function(){

        var display = ['collection_name','collection_description','institution_web_address'];
        var rows = [], contacts=[];
        var self = this;

        function makeName(val){
            var sp=val.split('_');
            var n=[];
            sp.forEach(function(str){
                n.push(str.charAt(0).toUpperCase() + str.slice(1));
            });
            return n.join(' ');
        }

        function makeContact(contact){
            var name = self.check(contact.first_name,'',' ') + self.check(contact.last_name);
            var email = self.check(contact.email);
            var phone =  self.check(contact.phone);
            var role =  self.check(contact.role);
            return (
                React.DOM.ul({className: "pull-left contact"}, 
                    React.DOM.li(null, name), 
                    React.DOM.li(null, role), 
                    React.DOM.li(null, React.DOM.a({href: 'mailto: '+email}, email)), 
                    React.DOM.li(null, phone)
                )
            );
        }     

        var data = this.props.data._source.data['idigbio:data'];

        if(_.has(data,'collection_name')){
            rows.push(
                React.DOM.div({className: "title"}, data.collection_name)
            )
        }
        if(_.has(data,'logo_url') && !_.isEmpty(data.logo_url)){
            rows.push(React.DOM.img({className: "logo", src: data.logo_url, onError: this.noLogo}))
        }
        if(_.has(data,'institution_web_address')){
            rows.push(
                React.DOM.a({href: data.institution_web_address}, 
                    data.institution_web_address
                )
            )
        }
        if(_.has(data,'collection_description')){
            var desc = _.unescape(data.collection_description);
            rows.push(
                React.DOM.div({className: "justify", dangerouslySetInnerHTML: {__html: desc}})
            )
        }

        var con;
        if(_.has(data,'contacts')){
            _.each(data.contacts,function(item){
                contacts.push(makeContact(item));
            })
            con = (
                React.DOM.div({id: "contacts"}, 
                    React.DOM.div({className: "title"}, "Contacts"), 
                    contacts
                )
            );
        }else{
            con = React.DOM.span(null);
        }

        return (
            React.DOM.div({id: "provider-info"}, 
                React.DOM.h4({className: "title"}, "Record Provided By"), 
                rows, 
                con
            )
        );
    }

})