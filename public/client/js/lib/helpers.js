/* Helpers module
* general view helping methods
****/

var helpers = module.exports = {
    // ### setSearchForm
    // sets all inputs based on values in a es query.
    // #### Parameters
    // 1. query: basic search object.
    setSearchForm: function(query){
    //set form controls queryBuilder search object
        //first clear all search inputs
        $('.search-input:text').val('');
        $('.search-input:checkbox').prop('checked',false);
        _.each(query,function(val,key){
            var split= key.split('-');
            if(split.length > 1){
                var type = split[split.length-1];
                if(type == 'checkbox'){
                    $('input[name="'+key+'"][value="'+val+'"]').attr('checked','checked');
                    $('textarea[name^="'+split[0]+'"], input[name^="'+split[0]+'"][type="text"]').attr('disabled','disabled');
                }else if(type == 'text'){
                    $(':input[name="'+key+'"]').val(val);
                }else{
                    //for range,locrange,geobounds]
                   $('input[name="'+key+'"]').val(val); 
                }
            }else{
                if(key=='hasImage'&&(val=='on'||val===true)){
                    $('.search-input[name="hasImage"').attr('checked','checked');
                }else{
                    $('.search-input[name="'+key+'"]').val(val);
                }
            }
        });
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

    // ### formatNum
    // formats a numeric into the proper string representation with commas.
    // #### Parameters
    // 1. num: number
    formatNum: function (num){
        return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    // ### strip
    // remove leading and trailing whitespace and formatting chars
    strip: function(str){
        return str.replace(/(\r\n|\n|\r)/gm,"").trim();
    },
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
    }
}     