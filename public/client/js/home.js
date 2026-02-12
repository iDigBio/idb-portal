
//var React = require('react');
//var HomePage = React.createFactory(require('./react/build/home'));
var idbapi = require('./lib/idbapi');

import 'c3/c3.css';

var colors = ['#6C477C','#56E4F4','#194B94','#ED2E2E','#C86B61'];
var kingdomColor={'Plantae': '#6aaa51','Fungi':'#d3b833' ,'Chromista': '#cf7a0b','Animalia': '#3782cd', 'Protozoa': '#DD5656' },colorsIndex=0;
var others = ["incertae","ichnofossil","taxon indet.","monocotyledonae","pteridophyta","dicotyledonae","protista","protoctista","monera","incertae sedis"]
var setGetColor = function(kingdom){
    if(_.isUndefined(colors[colorsIndex])){
        colorsIndex=0;
    }
    if(_.isUndefined(kingdomColor[kingdom])){
        kingdomColor[kingdom]=colors[colorsIndex];
        colorsIndex++;
    }
    return kingdomColor[kingdom];
};
var sortFunc = function(a,b){
    if (a[1] > b[1]) {
        return -1;
    }
    if (a[1] < b[1]) {
        return 1;
    }

    // a must be equal to b
    return 0;
};

var enablePieKeyboardAccess = function(options){
    var container = document.querySelector(options.bindto);
    if(!container){
        return;
    }
    var getLegendItem = function(node){
        var current = node;
        while(current && current !== container){
            if(current.classList && current.classList.contains('c3-legend-item')){
                return current;
            }
            current = current.parentNode;
        }
        return null;
    };
    var isKeyboardActivate = function(event){
        return event.key === 'Enter' ||
            event.key === ' ' ||
            event.keyCode === 13 ||
            event.keyCode === 32 ||
            event.which === 13 ||
            event.which === 32;
    };
    if(container.getAttribute('data-kb-container') !== 'true'){
        container.setAttribute('data-kb-container', 'true');
        container.addEventListener('keydown', function(event){
            if(!isKeyboardActivate(event)){
                return;
            }
            var legendItem = getLegendItem(event.target);
            if(!legendItem){
                return;
            }
            var className = legendItem.getAttribute('class') || '';
            var match = className.match(/c3-legend-item-([^\s]+)/);
            var targetId = match ? match[1] : null;
            event.preventDefault();
            if(options.chart && typeof options.chart.toggle === 'function' && targetId){
                options.chart.toggle(targetId);
            }else{
                var clickTarget = legendItem.querySelector('.c3-legend-item-event') || legendItem;
                clickTarget.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            }
        }, true);
    }
    var legendLabels = {};
    container.querySelectorAll('.c3-legend-item').forEach(function(item){
        var labelNode = item.querySelector('text');
        var label = labelNode ? labelNode.textContent.trim() : '';
        var className = item.getAttribute('class') || '';
        var match = className.match(/c3-legend-item-([^\s]+)/);
        if(match && label){
            legendLabels[match[1]] = label;
        }
    });

    var focusableSelectors = [
        '.c3-legend-item',
        '.c3-chart-arc .c3-arc'
    ];

    container.querySelectorAll(focusableSelectors.join(',')).forEach(function(element){
        if(element.getAttribute('data-kb-focus') === 'true'){
            return;
        }
        element.setAttribute('data-kb-focus', 'true');
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('focusable', 'true');
        element.addEventListener('focus', function(){
            element.classList.add('is-focus');
        });
        element.addEventListener('blur', function(){
            element.classList.remove('is-focus');
        });
    });

    container.querySelectorAll('.c3-legend-item').forEach(function(item){
        if(item.getAttribute('data-kb-bound') === 'true'){
            return;
        }
        item.setAttribute('data-kb-bound', 'true');
        var labelNode = item.querySelector('text');
        var label = labelNode ? labelNode.textContent.trim() : 'Legend item';
        var className = item.getAttribute('class') || '';
        var match = className.match(/c3-legend-item-([^\s]+)/);
        var targetId = match ? match[1] : label;
        item.setAttribute('aria-label', 'Toggle ' + label);
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('focusable', 'true');
        item.querySelectorAll('text, .c3-legend-item-event').forEach(function(child){
            child.removeAttribute('tabindex');
            child.removeAttribute('role');
            child.removeAttribute('focusable');
        });
    });

    container.querySelectorAll('.c3-chart-arc .c3-arc').forEach(function(arc){
        if(arc.getAttribute('data-kb-bound') === 'true'){
            return;
        }
        arc.setAttribute('data-kb-bound', 'true');
        var targetNode = arc.closest('.c3-target');
        var targetClass = targetNode ? (targetNode.getAttribute('class') || '') : '';
        var match = targetClass.match(/c3-target-([^\s]+)/);
        var targetKey = match ? match[1] : '';
        var label = legendLabels[targetKey] || targetKey.replace(/-/g, ' ') || 'Slice';
        arc.setAttribute('aria-label', 'View ' + label + ' records');
        arc.addEventListener('keydown', function(event){
            if(event.key === 'Enter' || event.key === ' '){
                event.preventDefault();
                if(label.toLowerCase() !== 'other'){
                    options.onSliceActivate(label);
                }
            }
        });
    });
};


//record pie chart
var record = {"rq":{"kingdom":{"type":"exists"}},"top_fields": ["kingdom"]};

idbapi.summary('top/records/',record,function(response){

    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(others.indexOf(k)===-1){
            king.push([helpers.firstToUpper(k),v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    })
    king.push(other);
    king.sort(sortFunc);
    king.forEach(function(item){
        colorOrder.push(setGetColor(item[0]));
    });

    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie',
            onclick: function(d,el){
                if(d.name.toLowerCase()!='other'){
                    window.location = '/portal/search?rq={"kingdom":"'+d.name+'"}';
                }
            }
        },
        bindto:'#specimen-chart',
        onrendered: function(){
            enablePieKeyboardAccess({
                bindto: '#specimen-chart',
                chart: this,
                onSliceActivate: function(label){
                    window.location = '/portal/search?rq={"kingdom":"'+label+'"}';
                }
            });
        },
        pie:{
            label:{
                format: function(value, ratio, id){
                    return Math.round(ratio*100*10)/10+'%'
                }
            }
        },
        color:{
            pattern: colorOrder
        },
        size:{
            height:280
        }
    })
})

//media pie chart
var media = {"rq":{"kingdom":{"type":"exists"},"hasImage":true},"top_fields": ["kingdom"]};

idbapi.summary('top/records/',media,function(response){

    var king=[],other=['other'],colorOrder=[];
    _.each(response.kingdom, function(v,k){
        if(others.indexOf(k)===-1){
            king.push([helpers.firstToUpper(k),v.itemCount]);
        }else{
            other.push(v.itemCount)
        }
    });
    king.push(other);
    king.sort(sortFunc);
    
    king.forEach(function(item){
        colorOrder.push(setGetColor(item[0]));
    });
    
    var chart = c3.generate({
        data:{
            columns: king,
            type: 'pie',
            onclick: function(d,el){
                if(d.name.toLowerCase()!='other'){
                    window.location = '/portal/search?rq={"kingdom":"'+d.name+'"}&view=media';
                }
            }
        },
        bindto:'#media-chart',
        onrendered: function(){
            enablePieKeyboardAccess({
                bindto: '#media-chart',
                chart: this,
                onSliceActivate: function(label){
                    window.location = '/portal/search?rq={"kingdom":"'+label+'"}&view=media';
                }
            });
        },
        color:{
            pattern: colorOrder
        },
        size:{
            height:280
        }
    })
})

function formatNum(num){
    return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// record counts
idbapi.summary('count/records/', function(resp) {
    $('#recordcount').html(formatNum(resp.itemCount));
});
idbapi.summary('count/media/', function(resp) {
    $('#mediacount').html(formatNum(resp.itemCount));
});
idbapi.summary('count/recordset/?rsq={"data.ingest": true}', function(resp) {
    $('#recordsets-total').html(formatNum(resp.itemCount));
});

function searchRq(value){
    var rq, type=$('#select-field').val();
    switch(type){
        case 'fulltext':
            rq = '{"data":{"type":"fulltext","value":"'+value+'"}}';
            break;
        case 'scientificname':
            rq = '{"scientificname":"'+value+'"}';
            break;
    }
    window.location = '/portal/search?rq='+rq;
}

$('#searchbox').keypress(function(e) {
    if(e.which == 13) {
        e.preventDefault();
        searchRq(this.value);
    }
});

$('#searchbtn').click(function(e){
    e.preventDefault();
    searchRq($('#searchbox').val());
});
