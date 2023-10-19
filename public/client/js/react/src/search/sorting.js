var React = require('react')
var RCTgroup = require('react-addons-css-transition-group');
var PureRender = require('react-addons-pure-render-mixin');

export default class Sorting extends React.Component{
    //mixins: [PureRender],
    constructor(props) {
        super(props);
        this.getSortNames = this.getSortNames.bind(this)
        this.addClick = this.addClick.bind(this)
        this.removeClick = this.removeClick.bind(this)
        this.sortChange = this.sortChange.bind(this)
        this.scrollSorts = this.scrollSorts.bind(this)
    }
    static defaultSorts(){
        return [
            {name: 'genus', order: 'asc'},
            {name: 'specificepithet', order: 'asc'},
            {name: 'datecollected', order: 'asc'}
        ]
    } 
    
    getSortNames(){
        var list=[];
        this.props.sorting.forEach(function(item){
            list.push(item.name);
        });
        return list;
    }
    addClick(event){
        var s = _.cloneDeep(this.props.sorting);
        s.push({name: false, order:'asc'});
        //this.setState({sorting: s});
        this.props.searchChange('sorting',s)
    }
    removeClick(event){
        var s = _.cloneDeep(this.props.sorting);
        s.splice(parseInt(event.currentTarget.attributes['data-index'].value),1);
        //this.setState({sorting: s});
        this.props.searchChange('sorting',s);
    }
    sortChange(event){
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
    }
    scrollSorts(e){
        e.preventDefault();
        $('#sort-group').animate({
            scrollTop: $('#sort-group').height()
        });
    }
    render(){
        var sorts=[],self=this,disabled=false;
        var options = [], names=this.getSortNames();
        
        var groups = ['taxonomy','specimen','collectionevent','locality','paleocontext'];
        //sort list
     

        this.props.sorting.forEach(function(item,ind){
            var fgroups =[];
            fgroups.push(<option key="default" value="0">select a field</option>);
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
                  <optgroup label={fields.groupNames[val]} key={val+ind}>
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
        if(sorts.length>=6){
            disabled=true;
        }
        return (
            <div className={"clearfix section "+this.props.active} id="sorting">
                <div id="sort-add">
                     Add a sort &nbsp;<button onClick={this.addClick} disabled={disabled}><span className="glyphicon glyphicon-plus"></span></button>
                </div>
                <div id="sort-group">
                    {sorts}
                </div>
                <div id="sort-scroller" >
                    <span style={{'display': 'block' }} onClick={this.scrollSorts}>
                        
                    </span>
                </div>
            </div>
        )
    }
};
//&darr; Scroll To Bottom &darr;

// export default Sorting;