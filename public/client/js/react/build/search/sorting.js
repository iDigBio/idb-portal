/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    getInitialState: function(){
        return {sorting: this.props.sorting};
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
                        React.DOM.option(null, "Scientific Name")
                    )
                )
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group-add"}, 
                     "Add another sort  ", React.DOM.button({onClick: this.addClick}, React.DOM.span({className: "glyphicon glyphicon-plus"}))
                ), 
                sorts
            )
        )
    }
})