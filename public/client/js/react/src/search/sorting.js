/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({
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
        _.each(groups,function(val){
            var flist = [];
            _.each(fields.byGroup[val],function(field){
                if(field.hidden===1){
                    //noop
                }else{
                    var disabled = names.indexOf(field.name) === -1 ? '' : 'disabled';
                    flist.push(
                            <option disabled={disabled} value={field.name} key={field.name}>
                                {field.name}
                            </option>
                    );
                }
            });
            fgroups.push(
              <optgroup label={fields.groupNames[val]}>
                &nbsp;&nbsp;{flist}
              </optgroup>
            );
        });
        this.state.sorting.forEach(function(item,ind){
            var txt='Then by';
            var rmv=<button onClick={self.removeClick} data-index={ind}><i className="glyphicon glyphicon-minus"></i></button>;
            if(ind===0){
                txt='Sort by';
                rmv=<span/>;
            }
            var asc=item.order == 'asc' ? 'selected':'';
            var desc=item.order == 'desc' ?  'selected':'';
            sorts.push(
                <div className="option-group">
                    <label>{txt}</label>
                    {rmv}
                    <select className="direction form-control" value={item.order} onChange={self.sortChange} data-index={ind} data-name='order'>
                        <option value="asc" >Ascending</option>
                        <option value="desc" >Descending</option>
                    </select>
                    <select className="name form-control" onChange={self.sortChange} data-index={ind} data-name='name'>
                        {fgroups}
                    </select>
                </div>
            )
        })
        return (
            <div>
                <div className="option-group-add">
                     Add another sort &nbsp;<button onClick={this.addClick}><span className="glyphicon glyphicon-plus"></span></button>
                </div>
                <div id="sort-group">
                    {sorts}
                </div>
            </div>
        )
    }
})