/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

module.exports = React.createClass({displayName: 'exports',
    getSortNames: function(){
        var list=[];
        this.props.sorting.forEach(function(item){
            list.push(item.name);
        });
        return list;
    },
    addClick: function(event){
        var s = _.cloneDeep(this.props.sorting);
        s.push({name: false, order:'asc'});
        //this.setState({sorting: s});
        this.props.searchChange('sorting',s)
    },
    removeClick: function(event){
        var s = _.cloneDeep(this.props.sorting);
        s.splice(parseInt(event.currentTarget.attributes['data-index'].value),1);
        //this.setState({sorting: s});
        this.props.searchChange('sorting',s);
    },
    sortChange: function(event){
        var ind = parseInt(event.currentTarget.attributes['data-index'].value);
        var sorting = this.props.sorting, sort=sorting[ind];
        if(event.currentTarget.value==='0'){
            sort[event.currentTarget.attributes['data-name'].value]=false;
        }else{
            sort[event.currentTarget.attributes['data-name'].value]=event.currentTarget.value;
        }
        
        sorting[ind]=sort;
        //this.setState({sorting: sorting});
        this.props.searchChange('sorting',sorting);
    },
    render: function(){
        var sorts=[],self=this;
        var options = [], names=this.getSortNames();
        
        var groups = ['taxonomy','specimen','collectionevent','locality','paleocontext'];
        //sort list
     

        this.props.sorting.forEach(function(item,ind){
            var fgroups =[];
            fgroups.push(React.DOM.option({value: "0"}, "select a field"));
            _.each(groups,function(val){
                var flist = [];
                _.each(fields.byGroup[val],function(field){
                    if(field.hidden===1){
                        //noop
                    }else{
                        var disabled='';
                        if(names.indexOf(field.term) > -1){
                            disabled='disabled';
                        } 
                        flist.push(
                            React.DOM.option({disabled: disabled, value: field.term, key: field.term}, 
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
            var asc=item.order == 'asc' ? 'selected':'';
            var desc=item.order == 'desc' ?  'selected':'';
            if(ind===0){
                sorts.push(
                    React.DOM.div({className: "option-group", key: ind}, 
                        React.DOM.label(null, "Sort by"), 
                        React.DOM.select({className: "name form-control", value: item.name, onChange: self.sortChange, 'data-index': ind, 'data-name': "name"}, 
                            fgroups
                        ), 
                        React.DOM.select({className: "direction form-control", value: item.order, onChange: self.sortChange, 'data-index': ind, 'data-name': "order"}, 
                            React.DOM.option({value: "asc", selected: asc}, "Ascending"), 
                            React.DOM.option({value: "desc", selected: desc}, "Descending")
                        )
                    )
                )
            }else{
                sorts.push(
                    React.DOM.div({className: "option-group", key: ind}, 
                        React.DOM.label(null, "Then by"), 
                        React.DOM.button({onClick: self.removeClick, 'data-index': ind}, React.DOM.i({className: "glyphicon glyphicon-minus"})), 
                        React.DOM.select({className: "name form-control", value: item.name, onChange: self.sortChange, 'data-index': ind, 'data-name': "name"}, 
                            fgroups
                        ), 
                        React.DOM.select({className: "direction form-control", value: item.order, onChange: self.sortChange, 'data-index': ind, 'data-name': "order"}, 
                            React.DOM.option({value: "asc"}, "Ascending"), 
                            React.DOM.option({value: "desc"}, "Descending")
                        )
                    )
                )
            }
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({id: "sort-add"}, 
                     "Add another sort  ", React.DOM.button({onClick: this.addClick}, React.DOM.span({className: "glyphicon glyphicon-plus"}))
                ), 
                React.DOM.div({id: "sort-group"}, 
                    RCTgroup({transitionName: "sort-trans"}, 
                        sorts
                    )
                )
            )
        )
    }
})