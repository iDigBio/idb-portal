/**
 * @jsx React.DOM
 */

var React = require('react/addons')
var RCTgroup = React.addons.CSSTransitionGroup;

module.exports = React.createClass({
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
            fgroups.push(<option value="0">select a field</option>);
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
                            <option disabled={disabled} value={field.term} key={field.term}>
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
            var asc=item.order == 'asc' ? 'selected':'';
            var desc=item.order == 'desc' ?  'selected':'';
            if(ind===0){
                sorts.push(
                    <div className="option-group" key={ind}>
                        <label>Sort by</label>
                        <select className="name form-control" value={item.name} onChange={self.sortChange} data-index={ind} data-name='name'>
                            {fgroups}
                        </select>
                        <select className="direction form-control" value={item.order} onChange={self.sortChange} data-index={ind} data-name='order'>
                            <option value="asc" selected={asc}>Ascending</option>
                            <option value="desc" selected={desc}>Descending</option>
                        </select>
                    </div>
                )
            }else{
                sorts.push(
                    <div className="option-group" key={ind}>
                        <label>Then by</label>
                        <button onClick={self.removeClick} data-index={ind}><i className="glyphicon glyphicon-minus"></i></button>
                        <select className="name form-control" value={item.name} onChange={self.sortChange} data-index={ind} data-name='name'>
                            {fgroups}
                        </select>
                        <select className="direction form-control" value={item.order} onChange={self.sortChange} data-index={ind} data-name='order'>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                )
            }
        })
        return (
            <div>
                <div id="sort-add">
                     Add another sort &nbsp;<button onClick={this.addClick}><span className="glyphicon glyphicon-plus"></span></button>
                </div>
                <div id="sort-group">
                    <RCTgroup transitionName="sort-trans">
                        {sorts}
                    </RCTgroup>
                </div>
            </div>
        )
    }
})