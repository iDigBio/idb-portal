
var React = require('react');
var _ = require('lodash');

module.exports = Provider = React.createClass({displayName: "Provider",
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
                React.createElement("ul", {key: name+email+role, className: "pull-left contact"}, 
                    React.createElement("li", null, name), 
                    React.createElement("li", null, role), 
                    React.createElement("li", null, React.createElement("a", {href: 'mailto: '+email}, email)), 
                    React.createElement("li", null, phone)
                )
            );
        }     
        //console.log(this.props.data)
        var data = this.props.data;
        if(_.has(data,'name')){
            rows.push(
                React.createElement("div", {key: "title", className: "title"}, 
                    React.createElement("a", {href: "/portal/recordsets/"+data.uuid}, data.name))
            )
        }
        if(_.has(data,'logo') && !_.isEmpty(data.logo)){
            rows.push(React.createElement("img", {key: "logo", className: "logo", src: data.logo, onError: this.noLogo}))
        }
        if(_.has(data,'url')){
            rows.push(
                React.createElement("a", {key: "link", href: data.url}, 
                    data.url
                )
            )
        }
        if(_.has(data,'description')){
            var desc = _.unescape(data.description);
            rows.push(
                React.createElement("div", {key: "description", className: "justify", dangerouslySetInnerHTML: {__html: desc}})
            )
        }

        var con;
        if(_.has(data,'contacts')){
            _.each(data.contacts,function(item){
                contacts.push(makeContact(item));
            })
            con = (
                React.createElement("div", {key: "contacts", id: "contacts"}, 
                    React.createElement("div", {className: "title"}, "Contacts"), 
                    contacts
                )
            );
        }else{
            con = React.createElement("span", null);
        }

        return (
            React.createElement("div", {id: "attribution", className: "clearfix section scrollspy"}, 
                React.createElement("h4", {className: "title"}, "Provided By"), 
                React.createElement("div", {id: "provider-info", className: "clearfix"}, 
                    rows, 
                    con
                )
            )
        );
    }

})