
var React = require('react');
var _ = require('lodash');

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
            /*return (
                <ul key={name+email+role}className="pull-left contact">
                    <li>{name}</li>
                    <li>{role}</li>
                    <li><a href={'mailto: '+email}>{email}</a></li>
                    <li>{phone}</li>
                </ul>
            );*/
            return (
                <table className="contact" key={name+email+role}>
                    <tbody>
                    <tr><td className="name">Name</td><td>{name}</td></tr>
                    <tr><td className="name">Role</td><td>{role}</td></tr>
                    <tr><td className="name">Email</td><td><a href={'mailto: '+email}>{email}</a></td></tr>
                    <tr><td className="name">Phone</td><td>{phone}</td></tr>
                    </tbody>
                </table>
            );
        }     
        //console.log(this.props.data)
        var data = this.props.data;
        var title = null, description = null, link = null, desc = null, logo = null;
        
        if(_.has(data,'name')){
            title = (
                <div key="title" className="title">
                    <a href={"/portal/recordsets/"+data.uuid}>{data.name}</a>
                </div>
            );
        }
        
        if(_.has(data,'description')){
            desc = (
                <span 
                    className="justify" 
                    dangerouslySetInnerHTML={{__html: _.unescape(data.description)}}>
                </span>
            );
        }

        if(_.has(data,'logo') && !_.isEmpty(data.logo)){
            logo = (<img key="logo" className="logo" src={data.logo} onError={this.noLogo} />)
        }
        
        description = (
            <p id="description" className="clearfix">
                {logo}
                {desc}
            </p>
        );

        if(_.has(data,'url')){
            link = (
                <a key="link" href={data.url}>
                    {data.url}
                </a>
            )
        }


        var con = null;
        var Cont = require('./contacts');

        if(_.has(data,'contacts') && data.contacts.length > 0){
            con = <Cont data={data} />;
        }

        return (
            <div id="attribution" className="clearfix section scrollspy">
                <h4 className="title">From Recordset</h4>
                <div id="provider-info" className="clearfix">
                    {title}
                    {link}
                    {description}
                    {con}
                </div>
            </div>
        );
    }

})