/* Fields Module
* This defines all the fields available for searching in the Advanced Search view
* and contains various config settings for the different fields.
* Not all terms come from raw ingested data. Search Results will show the value
* from "dataterm" field value if its defined in the field entry below.
* Otherwise, if dataterm is not defined it will display the value defined by the 
* "term" attribute which corresponds the indexed value in elastic search index.
* Other field keys are used for building various view code like range search fields,
* alternative column label names etc. 
****/
var _ = require('lodash');

var flds = require('./fields_def');

var dataOrder = {
    "collectionevent": [
        "dwc:recordedBy", 
        "dwc:fieldNotes", 
        "dwc:occurrenceRemarks", 
        "dwc:verbatimEventDate", 
        "dwc:fieldNumber", 
        "dwc:day", 
        "dwc:month", 
        "dwc:year"
    ], 
    "locality": [
        "dwc:continent", 
        "dwc:country", 
        "dwc:waterBody", 
        "dwc:stateProvince", 
        "dwc:county", 
        "dwc:locality", 
        "dwc:verbatimLocality", 
        "dwc:decimalLatitude", 
        "dwc:decimalLongitude", 
        "dwc:locationRemarks", 
        "dwc:coordinatePrecision", 
        "dwc:verbatimLatitude", 
        "dwc:verbatimLongitude", 
        "dwc:georeferenceProtocol", 
        "dwc:maximumDepthInMeters", 
        "dwc:minimumDepthInMeters", 
        "dwc:maximumElevationInMeters", 
        "dwc:minimumElevationInMeters", 
        "dwc:locationID"
    ], 
    "media": [
        "ac:associatedSpecimenReference", 
        "ac:attributionLogoUrl", 
        "ac:bestQualityAccessUri", 
        "ac:bestQualityFurtherInformationUrl", 
        "ac:captureDevice", 
        "ac:mediumQualityAccessUri", 
        "ac:providerId", 
        "ac:providerManagedId", 
        "ac:resourceCreationTechnique", 
        "ac:subjectOrientation", 
        "ac:subjectPart", 
        "ac:tag", 
        "ac:thumbnailAccessUri", 
        "dcterms:available", 
        "dcterms:bestQualityExtent", 
        "dcterms:bestQualityFormat", 
        "dcterms:creator", 
        "dcterms:description", 
        "dcterms:identifier", 
        "dcterms:mediumQualityFormat", 
        "dcterms:metadataCreator", 
        "dcterms:metadataLanguage", 
        "dcterms:metadataProvider", 
        "dcterms:modified", 
        "dcterms:provider", 
        "dcterms:rights", 
        "dcterms:thumbnailFormat", 
        "dcterms:title", 
        "dcterms:type", 
        "dwc:nameAccordingTo", 
        "xmprights:owner"
    ], 
    "other": [
        "dcterms:language", 
        "dcterms:modified", 
        "id"
    ], 
    "person": [
        "foaf:name", 
        "idigbio:institutionType", 
        "idigbio:institutionName", 
        "idigbio:collectionCategory", 
        "idigbio:collectionSize", 
        "idigbio:importantHoldings"
    ], 
    "specimen": [
        "dwc:typeStatus", 
        "dwc:identifiedBy", 
        "dwc:dateIdentified", 
        "dwc:identificationRemarks", 
        "dwc:catalogNumber", 
        "idigbio:barcodeValue", 
        "dwc:preparations", 
        "dwc:individualCount", 
        "dwc:lifeStage", 
        "dwc:sex", 
        "dwc:institutionCode", 
        "dwc:collectionCode", 
        "dwc:datasetName", 
        "dwc:basisOfRecord", 
        "dcterms:type"
    ], 
    "taxonomy": [
        "dwc:scientificName", 
        "dwc:genus", 
        "dwc:family", 
        "dwc:kingdom", 
        "dwc:phylum", 
        "dwc:class", 
        "dwc:scientificNameAuthorship", 
        "dwc:nomenclaturalStatus", 
        "dwc:taxonRank"
    ]
}
var type_order = ["taxonomy","specimen","collectionevent","locality","paleocontext","other","media","person"];
var order = [];
_.each(type_order,function(v){
    order.push(dataOrder[v]);
});
order = _.flatten(order);
//reverse lookup
var fieldst = {}, defaultFields = [], dataterms = {}, rangeterms = {}, defaultTerms = [],groups = {};
_.each(flds, function(value, key) {
    var val = _.clone(value);

    val["name"] = key;
    fieldst[val["term"]] = val;

    if(typeof val.dataterms !== 'undefined'){

        _.each(val.dataterms,function(v,k){
            var vals = _.clone(val);
            vals["parentName"] = key;
            vals["name"] = k;
            dataterms[v]=vals;
        });
    }else if(typeof val.dataterm !== 'undefined'){
        val["name"] = key;
        dataterms[val['dataterm']] = val;
    }
    //
    if(val.default === 1){
        defaultFields.push(key);
        defaultTerms.push(value['term']);
    }
    if(_.has(val, 'group')){
        if(_.isUndefined(groups[val.group])){
            groups[val.group]=[];
        }
        groups[val.group].push(val);
    }
   
});
//add special atts here //they only need look by term 
//fieldst['hasImage'] = {"name": 'Has Image', "term": 'hasImage'};  
//fieldst['recordset'] = {"name": 'Recordset', "term": 'recordset'};
//
module.exports = {
    byName: flds,
    byTerm: fieldst,
    order: order,
    orderByType: dataOrder,
    typeOrder: type_order, 
    searchGroups: ['taxonomy','specimen','collectionevent','locality','paleocontext','other'],
    groupNames: {"taxonomy":"Taxonomy","specimen":"Specimen","collectionevent":"Collection Event","locality":"Locality", "paleocontext": "Paleo Context","other":"Other","media":"Media","person":"Person"},
    byDataTerm: dataterms,
    defaults: defaultFields,
    defaultTerms: defaultTerms,
    rangeTerms: rangeterms,
    byGroup: groups
};

