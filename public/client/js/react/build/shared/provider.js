
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
            /*return (
                <ul key={name+email+role}className="pull-left contact">
                    <li>{name}</li>
                    <li>{role}</li>
                    <li><a href={'mailto: '+email}>{email}</a></li>
                    <li>{phone}</li>
                </ul>
            );*/
            return (
                React.createElement("table", {className: "contact", key: name+email+role}, 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Name"), React.createElement("td", null, name)), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Role"), React.createElement("td", null, role)), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Email"), React.createElement("td", null, React.createElement("a", {href: 'mailto: '+email}, email))), 
                    React.createElement("tr", null, React.createElement("td", {className: "name"}, "Phone"), React.createElement("td", null, phone))
                )
            );
        }     
        //console.log(this.props.data)
        var data = this.props.data;
        var title = null, description = null, link = null, desc = null, logo = null;
        
        if(_.has(data,'name')){
            title = (
                React.createElement("div", {key: "title", className: "title"}, 
                    React.createElement("a", {href: "/portal/recordsets/"+data.uuid}, data.name)
                )
            );
        }
        
        if(_.has(data,'description')){
            desc = (
                React.createElement("span", {
                    className: "justify", 
                    dangerouslySetInnerHTML: {__html: _.unescape(data.description)}}
                )
            );
        }

        if(_.has(data,'logo') && !_.isEmpty(data.logo)){
            logo = (React.createElement("img", {key: "logo", className: "logo", src: data.logo, onError: this.noLogo}))
        }
        
        description = (
            React.createElement("p", {id: "description", className: "clearfix"}, 
                logo, 
                desc
            )
        );

        if(_.has(data,'url')){
            link = (
                React.createElement("a", {key: "link", href: data.url}, 
                    data.url
                )
            )
        }


        var con = null;
        
        if(_.has(data,'contacts') && data.contacts.length > 0){
            _.each(data.contacts,function(item){
                contacts.push(makeContact(item));
            })
            con = (
                React.createElement("div", {key: "contacts", id: "contacts", className: "clearfix"}, 
                    React.createElement("h5", {className: "title"}, "Contacts"), 
                    contacts
                )
            );
        }

        return (
            React.createElement("div", {id: "attribution", className: "clearfix section scrollspy"}, 
                React.createElement("h4", {className: "title"}, "Provided By"), 
                React.createElement("div", {id: "provider-info", className: "clearfix"}, 
                    title, 
                    link, 
                    description, 
                    con
                )
            )
        );
    }

})