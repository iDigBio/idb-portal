import React from 'react';

export function defaultSorts(){
    return [
        {name: 'genus', order: 'asc'},
        {name: 'specificepithet', order: 'asc'},
        {name: 'datecollected', order: 'asc'}
    ]
}
const Sorting = ({sorting, searchChange, active}) => {

    function getSortNames(){
        var list=[];
        sorting.forEach(function(item){
            list.push(item.name);
        });
        return list;
    }
    function addClick(event){
        var s = _.cloneDeep(sorting);
        s.push({name: false, order:'asc'});
        searchChange('sorting',s)
    }
    function removeClick(event){
        var s = _.cloneDeep(sorting);
        s.splice(parseInt(event.currentTarget.attributes['data-index'].value),1);
        searchChange('sorting',s);
    }
    function sortChange(event){
        var ind = parseInt(event.currentTarget.attributes['data-index'].value);
        var localSorting = sorting, sort=sorting[ind];
        if(event.currentTarget.value==='0'){
            sort[event.currentTarget.attributes['data-name'].value]=false;
        }else{
            sort[event.currentTarget.attributes['data-name'].value]=event.currentTarget.value;
        }
        
        localSorting[ind]=sort;
        searchChange('sorting',localSorting);
    }
    function scrollSorts(e){
        e.preventDefault();
        $('#sort-group').animate({
            scrollTop: $('#sort-group').height()
        });
    }

    var sorts=[],self=this,disabled=false;
    var options = [], names=getSortNames();

    var groups = ['taxonomy','specimen','collectionevent','locality','paleocontext'];
    //sort list


    sorting.forEach(function(item,ind){
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
                    <button onClick={removeClick} data-index={ind}><i className="glyphicon glyphicon-minus"></i></button>
                    <select className="name form-control" value={item.name} onChange={sortChange} data-index={ind} data-name='name'>
                        {fgroups}
                    </select>
                    <select className="direction form-control" value={item.order} onChange={sortChange} data-index={ind} data-name='order'>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
            )
        }else{
            sorts.push(
                <div className="option-group" key={ind}>
                    <label>Then by</label>
                    <button onClick={removeClick} data-index={ind}><i className="glyphicon glyphicon-minus"></i></button>
                    <select className="name form-control" value={item.name} onChange={sortChange} data-index={ind} data-name='name'>
                        {fgroups}
                    </select>
                    <select className="direction form-control" value={item.order} onChange={sortChange} data-index={ind} data-name='order'>
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
        <div className={"clearfix section "+active} id="sorting">
            <div id="sort-add">
                 Add a sort &nbsp;<button onClick={addClick} disabled={disabled}><span className="glyphicon glyphicon-plus"></span></button>
            </div>
            <div id="sort-group">
                {sorts}
            </div>
            <div id="sort-scroller" >
                <span style={{'display': 'block' }} onClick={scrollSorts}>

                </span>
            </div>
        </div>
    )

};
//&darr; Scroll To Bottom &darr;

export default Sorting;