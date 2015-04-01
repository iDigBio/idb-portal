/* Helpers module
* general view helping methods
****/
var _ = require('lodash');
var helpers = module.exports = {

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

    // ### formatNum
    // formats a numeric into the proper string representation with commas.
    // #### Parameters
    // 1. num: number
    formatNum: function (num){
        return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    firstToUpper: function(str){
        return str.substr(0,1).toUpperCase() + str.substr(1,str.length-1).toLowerCase();
    },
    // ### strip
    // remove leading and trailing whitespace and formatting chars
    strip: function(str){
        return str.replace(/(\r\n|\n|\r)/gm,"").trim();
    },
    /*
    *Pretty print JSON 
    ****/
    formatJSON: function(json) {
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
    },
    /*
    *Test string for valid email
    ****/
    testEmail: function(value){
        var emailreg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailreg.test(value);
    },

    /*
    *filter: tests array elements for undefinedness and returns array of valid elements
    ****/
    filter: function(vals){
        return _.filter(vals,function(item){
            return !_.isUndefined(item);
        })
    },
    /*
    *filterFirst: iterates array and returns first element that is not undefined
    ****/
    filterFirst: function(vals){
        var out,i;
        for(i=0;i<vals.length;i++){
            if(!_.isUndefined(vals[i])){
                out=vals[i];
                break;
            }
        }
        return out;
    }       
}     