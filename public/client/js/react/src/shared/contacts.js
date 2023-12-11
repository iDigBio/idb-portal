//
import React from 'react'
import _ from 'lodash'

var defOrNone = function(obj,key){
    if(_.isArray(key)){
        var str = '';
        key.forEach(function(item){
            if(typeof obj[item] != 'undefined'){
                str += ' ' + obj[item];  
            }
        });
        if( str.length === 0){
            return <i>none</i>;
        }else{
            return str;
        }
    }else if(typeof obj[key] == 'undefined'){
        return <i>none</i>;
    }else{
        return obj[key];
    }
};

var phDisplay = function(phone){
    if(typeof(phone)==='string'){
        if(phone.includes('none')) {
            return '';
        } else {
            return <tr><td className="name">Phone</td><td>{phone}</td></tr>;
        }
    }
};

const Contacts = ({data}) => {
    function makeContact(contact){
            var name = defOrNone(contact, ['first_name', 'last_name']);
            var email = defOrNone(contact, 'email');
            email = _.isString(email) ? <a href={'mailto: '+email}>{email}</a> : email;
            var phone = defOrNone(contact, 'phone');
            var role = defOrNone(contact, 'role');

            return (
                <table className="contact" key={_.uniqueId()}>
                    <tbody>
                    <tr><td className="name">Name</td><td>{name}</td></tr>
                    <tr><td className="name">Role</td><td>{role}</td></tr>
                    <tr><td className="name">Email</td><td>{email}</td></tr>
                    {phDisplay(phone)}
                    </tbody>
                </table>
            );   
    }

    if(_.has(data, 'contacts') && _.isArray(data.contacts)){
        var contacts = _.map(data.contacts,makeContact)
        return (
            <div id="contacts" className="clearfix scrollspy">
                <h2 className="title">Contacts</h2>
                {contacts}
            </div>
        )
    }else{
        return null;
    }

}

export default Contacts;