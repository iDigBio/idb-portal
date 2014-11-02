/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    getInitialState: function(){
        return {sorting: this.props.sorting};
    },
    getSortNames: function(){
        var list=[];
        this.props.sorting.forEach(function(item){
            list.push(item.name);
        });
        return list;
    },
    addClick: function(event){
        var s = _.cloneDeep(this.state.sorting);
        s.push({name: false, order:'desc'});
        this.setState({sorting: s});
    },
    removeClick: function(event){
        var s = _.cloneDeep(this.state.sorting);
        s.splice(parseInt(event.currentTarget.attributes['data-index'].value),1);
        this.setState({sorting: s});
        this.props.searchChange('sorting',s);
    },
    sortChange: function(event){
        var ind = parseInt(event.currentTarget.attributes['data-index'].value);
        var sorting = this.state.sorting, sort=sorting[ind];
        sort[event.currentTarget.attributes['data-name'].value]=event.currentTarget.value;
        sorting[ind]=sort;
        this.setState({sorting: sorting});
        this.props.searchChange('sorting',sorting);
    },
    render: function(){
        var sorts=[],self=this;
        var options = [], names=this.getSortNames();
        var fgroups =[];
        var groups = ['taxonomy','specimen','collectionevent','locality'];
        //sort list
        _.each(groups,function(val){
            var flist = [];
            fgroups.push(React.DOM.option({value: "0"}, "select a field"));
            _.each(fields.byGroup[val],function(field){
                if(field.hidden===1){
                    //noop
                }else{
                    var disabled = names.indexOf(field.name) === -1 ? '' : 'disabled';
                    flist.push(
                            React.DOM.option({disabled: disabled, value: field.name, key: field.name}, 
                                field.name
                            )
                    );
                }
            });
            fgroups.push(
              React.DOM.optgroup({label: fields.groupNames[val]}, 
                "  ", flist
              )
            );
        });
        this.state.sorting.forEach(function(item,ind){
            var txt='Then by';
            var rmv=React.DOM.button({onClick: self.removeClick, 'data-index': ind}, React.DOM.i({className: "glyphicon glyphicon-minus"}));
            if(ind===0){
                txt='Sort by';
                rmv=React.DOM.span(null);
            }
            var asc=item.order == 'asc' ? 'selected':'';
            var desc=item.order == 'desc' ?  'selected':'';
            sorts.push(
                React.DOM.div({className: "option-group"}, 
                    React.DOM.label(null, txt), 
                    rmv, 
                    React.DOM.select({className: "direction form-control", value: item.order, onChange: self.sortChange, 'data-index': ind, 'data-name': "order"}, 
                        React.DOM.option({value: "asc"}, "Ascending"), 
                        React.DOM.option({value: "desc"}, "Descending")
                    ), 
                    React.DOM.select({className: "name form-control", onChange: self.sortChange, 'data-index': ind, 'data-name': "name"}, 
                        fgroups
                    )
                )
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group-add"}, 
                     "Add another sort  ", React.DOM.button({onClick: this.addClick}, React.DOM.span({className: "glyphicon glyphicon-plus"}))
                ), 
                React.DOM.div({id: "sort-group"}, 
                    sorts
                )
            )
        )
    }
})