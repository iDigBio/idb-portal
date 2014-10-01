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
var _ = require('underscore');

var flds = {
    "Kingdom": {
        "term": "kingdom",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:kingdom"
    },
    "Phylum": {
        "term": "phylum",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:phylum"
    },
    "Class": {
        "term": "class",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:class"
    },
    "Order": {
        "term": "order",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:order"
    },
    "Family": {
        "term": "family",
        "type": "text-sn",
        "default": 1,
        "group": "taxonomy",
        "dataterm": "dwc:family"
    },
    "Scientific Name": {
        "term": "scientificname",
        "type": "text-sn",
        "default": 1,
        "group": "taxonomy",
        "dataterm": "dwc:scientificName"
    },
    "Genus": {
        "term": "genus",
        "type": "text-sn",
        "default": 1,
        "group": "taxonomy",
        "dataterm": "dwc:genus"
    },
    "Specific Epithet": {
        "term": "specificepithet",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:specificEpithet"
    },
    "Infraspecific Epithet": {
        "term": "infraspecificepithet",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:infraspecificEpithet"
    },
    "Higher Taxon": {
        "term": "highertaxon",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:higherClassification"
    },
    "Common Name":{
        "term": "commonname",
        "type": "text",
        "group": "taxonomy",
        "dataterm": "dwc:vernacularName"
    },
    //this field is bound by a elastic search filter rather then idigbio index term
    "Latitude/Longitude Bounds": {
        "columnLabel": "Lat / Lon",
        "term": "geopoint",
        //"terms": [{'Lat':'geopoint.lat'},{'Lon': 'geopoint.lon'}],
        "type": "geobounds",
        "group": "locality",
        "sortable": 0,
        "defaults": {"top_left":{"lat":89.99999,"lon":-180},"bottom_right":{"lat":-90,"lon": 179.99999}}
    },
    "Lat" : {
        "term": "lat",
        "dataterm": "dwc:decimalLatitude",
        "type": "text",
        "group": "locality",
        "hidden":1
    },
    "Lon": {
        "term": "lon",
        "dataterm": "dwc:decimalLongitude",
        "type": "text",
        "group": "locality",
        "hidden": 1
    },
    "Country": {
        "term": "country",
        "type": "text",
        "default": 1,
        "group": "locality",
        "dataterm": "dwc:country"
    },
    "State/Province": {
        "term": "stateprovince",
        "type": "text",
        "default": 1,
        "group": "locality",
        "dataterm": "dwc:stateProvince"
    },
    "County/Parish/Province": {
        "term": "county",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:county"
    },
    "Municipality": {
        "term": "municipality",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:municipality"
    },
    "Water Body": {
        "term": "waterbody",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:waterBody"
    },
    "Continent": {
        "term": "continent",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:continent"
    },
    "Date Collected": {
        "term": "datecollected",
        "type": "daterange",
        "group": "collectionevent"
        //event date is determined from several date fields
    },
    "Locality": {
        "term": "locality",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:locality",
        "tokenized": 1
    },
    "Verbatim Locality": {
        "term": "verbatimlocality",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:verbatimLocality",
        "tokenized": 1
    },
    "Institution Name": {
        "term": "institutionname",
        "type": "text",
        "group": "collectionevent"
    },
    "Institution Code": {
        "term": "institutioncode",
        "type": "text",
        "group": "collectionevent",
        "dataterm": "dwc:institutionCode"
    },
    "Collector": {
        "term": "collector",
        "type": "text",
        "group": "collectionevent",
        "dataterm": "dwc:recordedBy"
    },
    "Field Number": {
        "term": "fieldnumber",
        "type": "text",
        "group": "collectionevent",
        "dataterm": "dwc:fieldNumber"
    },
    "Catalog Number": {
        "term": "catalognumber",
        "type": "text",
        "group": "specimen",
        "dataterm": "dwc:catalogNumber"
    },
    "Barcode Value": {
        "term": "barcodevalue",
        "type": "text",
        "group": "specimen",
        "dataterm": "idigbio:barcodeValue"
    },
    "Type Status": {
        "term": "typestatus",
        "type": "text",
        "group": "specimen",
        "dataterm": "dwc:typeStatus"
    },
    "Collection Code": {
        "term": "collectioncode",
        "type": "text",
        "group": "specimen",
        "dataterm": "dwc:collectionCode"
    },
    "Collection Name": {
        "term": "collectionname",
        "type": "text",
        "group": "collectionevent",
        "dataterm": "idigbio:collectionName",
        "hidden": 1
    },

    "Minimum Elevation": {
        "term": "minelevation",
        "type": "locrange",
        "group": "locality",
        "dataterm": "dwc:minimumElevationInMeters"
    },
    "Maximum Elevation": {
        "term": "maxelevation", 
        "type": "locrange",
        "group": "locality",
        "dataterm": "dwc:maximumElevationInMeters" 
    },
    "Minimum Depth": {
        "term": "mindepth",
        "type": "locrange",
        "group": "locality",
        "dataterm": "dwc:minimumDepthInMeters"
    },
    "Maximum Depth": {
        "term": "maxdepth",
        "type": "locrange",
        "group": "locality",
        "dataterm": "dwc:maximumDepthInMeters"
    },
    "Earliest Period": {
        "term": "earliestperiodorlowestsystem",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:earliestPeriodOrLowestSystem"
    },
    "Latest Period": {
        "term": "latestperiodorhighestsystem",
        "type": "text",
        "group": "locality",
        "dataterm": "dwc:latestPeriodOrHighestSystem"
    },
    "Occurence ID":{
        "term": "occurrenceid",
        "type": "text",
        "group":"collectionevent",
        "dataterm": "dwc:occurrenceID"
    },
    "Recordset": {
        "term": "recordset",
        "type": "text",
        "group": "collectionevent"
    },
    "RecordID": {
        "term": "recordid",
        "type": "text",
        "group": "collectionevent"
    },
    "Basis of Record":{
        "term": "basisofrecord",
        "type": "text",
        "dataterm": "dwc:basisOfRecord",
        "group": "specimen"
    }
}

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
var type_order = ["taxonomy","specimen","collectionevent","locality","other","media","person"];
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
fieldst['hasImage'] = {"name": 'Has Image', "term": 'hasImage'};  
//fieldst['recordset'] = {"name": 'Recordset', "term": 'recordset'};
//
module.exports = {
    byName: flds,
    byTerm: fieldst,
    order: order,
    orderByType: dataOrder,
    typeOrder: type_order, 
    groupNames: {"taxonomy":"Taxonomy","specimen":"Specimen","collectionevent":"Collection Event","locality":"Locality","other":"Other","media":"Media","person":"Person", "paleo": "Paleo"},
    byDataTerm: dataterms,
    defaults: defaultFields,
    defaultTerms: defaultTerms,
    rangeTerms: rangeterms,
    byGroup: groups
};

