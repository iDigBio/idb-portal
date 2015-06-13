/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

var Sort = module.exports = React.createClass({displayName: "exports",
    statics: {
        defaultSorts: function(){
            return [
                {name: 'genus', order: 'asc'},
                {name: 'specificepithet', order: 'asc'},
                {name: 'datecollected', order: 'asc'}
            ]
        } 
    },
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
    scrollSorts: function(e){
        e.preventDefault();
        $('#sort-group').animate({
            scrollTop: $('#sort-group').height()
        });
    },
    render: function(){
        var sorts=[],self=this,disabled=false;
        var options = [], names=this.getSortNames();
        
        var groups = ['taxonomy','specimen','collectionevent','locality','paleocontext'];
        //sort list
     

        this.props.sorting.forEach(function(item,ind){
            var fgroups =[];
            fgroups.push(React.createElement("option", {value: "0"}, "select a field"));
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
                            React.createElement("option", {disabled: disabled, value: field.term, key: field.term}, 
                                field.name
                            )
                        );
                    }
                });
                fgroups.push(
                  React.createElement("optgroup", {label: fields.groupNames[val], key: val+ind}, 
                    "  ", flist
                  )
                );
            });
            var asc=item.order == 'asc' ? 'selected':'';
            var desc=item.order == 'desc' ?  'selected':'';
            if(ind===0){
                sorts.push(
                    React.createElement("div", {className: "option-group", key: ind}, 
                        React.createElement("label", null, "Sort by"), 
                        React.createElement("button", {onClick: self.removeClick, "data-index": ind}, React.createElement("i", {className: "glyphicon glyphicon-minus"})), 
                        React.createElement("select", {className: "name form-control", value: item.name, onChange: self.sortChange, "data-index": ind, "data-name": "name"}, 
                            fgroups
                        ), 
                        React.createElement("select", {className: "direction form-control", value: item.order, onChange: self.sortChange, "data-index": ind, "data-name": "order"}, 
                            React.createElement("option", {value: "asc", selected: asc}, "Ascending"), 
                            React.createElement("option", {value: "desc", selected: desc}, "Descending")
                        )
                    )
                )
            }else{
                sorts.push(
                    React.createElement("div", {className: "option-group", key: ind}, 
                        React.createElement("label", null, "Then by"), 
                        React.createElement("button", {onClick: self.removeClick, "data-index": ind}, React.createElement("i", {className: "glyphicon glyphicon-minus"})), 
                        React.createElement("select", {className: "name form-control", value: item.name, onChange: self.sortChange, "data-index": ind, "data-name": "name"}, 
                            fgroups
                        ), 
                        React.createElement("select", {className: "direction form-control", value: item.order, onChange: self.sortChange, "data-index": ind, "data-name": "order"}, 
                            React.createElement("option", {value: "asc"}, "Ascending"), 
                            React.createElement("option", {value: "desc"}, "Descending")
                        )
                    )
                )
            }
        })
        if(sorts.length>=6){
            disabled=true;
        }
        return (
            React.createElement("div", {className: "clearfix section "+this.props.active, id: "sorting"}, 
                React.createElement("div", {id: "sort-add"}, 
                     "Add a sort  ", React.createElement("button", {onClick: this.addClick, disabled: disabled}, React.createElement("span", {className: "glyphicon glyphicon-plus"}))
                ), 
                React.createElement("div", {id: "sort-group"}, 
                    sorts
                ), 
                React.createElement("div", {id: "sort-scroller"}, 
                    React.createElement("span", {style: {'display': 'block'}, onClick: this.scrollSorts}, 
                        "↓ Scroll To Bottom ↓"
                    )
                )
            )
        )
    }
})