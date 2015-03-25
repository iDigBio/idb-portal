
var React = require('react');
var helpers = require('../../lib/helpers');

module.exports = Collection = React.createClass({displayName: "Collection",

    render: function(){
        var self=this;
        var regex = /(((ftp|https?):\/\/|www)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;

        var rows =_.map(_.without(_.keys(self.props.data),'update_url'),function(key){
            var frags = key.split('_');
            for(i=0; i<frags.length; i++) {
                frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
            }
           var val,link;
            if(_.isString(self.props.data[key]) && self.props.data[key].match(regex)!==null){
                link = self.props.data[key].trim();
                if(link.indexOf('http')!==0){
                    link='http://'+link;
                }  
                val = (
                    React.createElement("a", {target: "_outlink", href: link}, 
                        link
                    )
                )              
            }else{
                val = self.props.data[key];
            }
            if(key=='contact_email' && helpers.testEmail(val)){
                val = React.createElement("a", {href: 'mailto:'+val}, val)
            }
            if(key=='recordsets'){
                if(_.isString(val)){
                    var records = val.split(/,/);
                    var links=[];
                    records.forEach(function(item){
                        if(item.trim().length > 0){
                            links.push(
                                React.createElement("a", {href: '/portal/recordsets/'+item.trim(), key: item}, item)
                            )
                        }
                    })
                    val = React.createElement("span", null, links)
                }
            }
            //var val = self.props.data[key];
            return (
                React.createElement("tr", {key: key}, 
                    React.createElement("td", {className: "name"}, frags.join(' ')), 
                    React.createElement("td", null, val)
                )
            )
        })
        var title = this.props.data.institution;
        if(!_.isEmpty(this.props.data.collection)){
            title+=' - '+this.props.data.collection;
        }
        return (
            React.createElement("div", {className: "col-lg-10 col-lg-offset-1"}, 
                React.createElement("h3", null, "Collection: ", title), 
                React.createElement("a", {className: "pull-right", href: this.props.data.update_url, target: "_new"}, "Update/Add Information"), 
                React.createElement("table", {className: "table table-bordered table-condensed"}, 
                    rows
                )
            )
        )
    }
});