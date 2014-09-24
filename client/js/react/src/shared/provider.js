/**
 * @jsx React.DOM
 */
var React = require('react');
var _ = require('underscore');

module.exports = React.createClass({
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
                <ul className="pull-left contact">
                    <li>{name}</li>
                    <li>{role}</li>
                    <li><a href={'mailto: '+email}>{email}</a></li>
                    <li>{phone}</li>
                </ul>
            );
        }     

        var data = this.props.data._source.data['idigbio:data'];

        if(_.has(data,'collection_name')){
            rows.push(
                <div className="title">{data.collection_name}</div>
            )
        }
        if(_.has(data,'logo_url') && !_.isEmpty(data.logo_url)){
            rows.push(<img className="logo" src={data.logo_url} onError={this.noLogo} />)
        }
        if(_.has(data,'institution_web_address')){
            rows.push(
                <a href={data.institution_web_address}>
                    {data.institution_web_address}
                </a>
            )
        }
        if(_.has(data,'collection_description')){
            var desc = _.unescape(data.collection_description);
            rows.push(
                <div className="justify" dangerouslySetInnerHTML={{__html: desc}}></div>
            )
        }

        var con;
        if(_.has(data,'contacts')){
            _.each(data.contacts,function(item){
                contacts.push(makeContact(item));
            })
            con = (
                <div id="contacts">
                    <div className="title">Contacts</div>
                    {contacts}
                </div>
            );
        }else{
            con = <span />;
        }

        return (
            <div id="provider-info">
                <h4 className="title">Record Provided By</h4>
                {rows}
                {con}
            </div>
        );
    }

})