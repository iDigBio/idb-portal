//
var React = require('react');
var _ = require('lodash');

var defOrNone = function(obj,key){
    if(_.isArray(key)){
        var str = '';
        key.forEach(function(item){
            if(typeof obj[item] != 'undefined'){
                str += ' ' + obj[item];  
            }
        });
        if( str.length === 0){
            return React.createElement("i", null, "none");
        }else{
            return str;
        }
    }else if(typeof obj[key] == 'undefined'){
        return React.createElement("i", null, "none");
    }else{
        return obj[key];
    }
};

module.exports = React.createClass({displayName: "exports",
    makeContact: function(contact){
            var name = defOrNone(contact, ['first_name', 'last_name']);
            var email = defOrNone(contact, 'email');
            email = _.isString(email) ? React.createElement("a", {href: 'mailto: '+email}, email) : email;
            var phone = defOrNone(contact, 'phone');
            var role = defOrNone(contact, 'role');

            return (
                React.createElement("table", {className: "contact", key: name+email+role}, 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Name"), React.createElement("td", null, name)), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Role"), React.createElement("td", null, role)), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Email"), React.createElement("td", null, email)), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Phone"), React.createElement("td", null, phone))
                )
            );   
    },
    render: function(){
        if(_.has(this.props.data, 'contacts') && _.isArray(this.props.data.contacts)){
            var contacts = _.map(this.props.data.contacts,this.makeContact)
            return (
                React.createElement("div", {id: "contacts", className: "clearfix scrollspy"}, 
                    React.createElement("h2", {className: "title"}, "Contacts"), 
                    contacts
                )
            )           
        }else{
            return null;
        }   
    }
})