/*
*Title : component expects props [data] = api record with data and indexTerms dictionary
****/
import React, { useCallback } from 'react';
import _ from 'lodash'


const Title = ({ data, mediaSearch, includeLink, attribution }) => {
    const click = useCallback((e) => {
        window.location = "/portal/records/" + data.uuid;
    }, [data.uuid]);

    const taxaBreadCrumb = useCallback(() => {
        var output = [];
        // Existing logic for taxaBreadCrumb
        return output;
    }, []);

    if (_.has(data, 'indexTerms')) {
        var title = '', info = [], taxonomy = ['kingdom', 'phylum', 'class', 'order', 'family'];
        var index = data.indexTerms, dataDetails = data.data;

        if (_.has(index, 'scientificname')) {
            title = _.capitalize(index['scientificname']);
            taxonomy.push('scientificname');
        } else if (_.has(index, 'genus')) {
            title = _.capitalize(index['genus']);
            taxonomy.push('genus');
            if (_.has(index, 'specificepithet')) {
                title += " " + index['specificepithet'];
                taxonomy.push('specificepithet');
            }
        }

        if (_.isEmpty(title)) {
            title = <em>No Name</em>;
        }

        info = _.without([index.indexData['dwc:scientificNameAuthorship']], undefined);

        var order = [], linktitle = [];
        _.each(taxonomy, function (item) {
            if (_.has(index, item)) {
                order.push(`"${item}":"${encodeURI(index[item].replace(/"/g, '\\"'))}"`);
                linktitle.push(item + ': ' + index[item].replace('"', ''));
            }
        });

        var str = `/portal/search?rq={${order.join(',')}}`;
        if (mediaSearch) {
            str += '&view=media';
        }
        var nameLink = <a title={'SEARCH ' + linktitle.join(', ')} href={str}>{title}</a>;

        var link = null;
        if (includeLink) {
            console.log(data.uuid)
            link = (
                <span className="title-link">
                    <a href={"/portal/records/" + data.uuid} title="go to associated specimen record">view specimen record</a>
                </span>
            );
        }

        return (
            <div id="title">
                <h1 className="clearfix">
                    <span className="title">
                        <em>{nameLink}</em>
                        <span className="title-addition">
                            {info.join(', ')}
                        </span>
                        {link}
                    </span>
                </h1>
                <h2>
                    From <a href={'/portal/recordsets/' + attribution.uuid}>{attribution.name}</a>
                </h2>
            </div>
        );
    } else {
        return (
            <div id="title">
                <h1><span className="title"><em>No Associated Specimen Record</em></span></h1>
                <h2>
                    From <a href={'/portal/recordsets/' + attribution.uuid}>{attribution.name}</a>
                </h2>
            </div>
        );
    }
};

export default Title;
