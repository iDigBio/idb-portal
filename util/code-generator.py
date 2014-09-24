#!/usr/bin/env python

import csv
import pprint
import json
import cStringIO

items = {}
dwc_to_context_term = {}
solr_to_context_term = {}
master_to_context = {}

import requests
response = requests.get('https://docs.google.com/spreadsheet/ccc?key=0AvMqM-SMbq09dERsNkppX05Sd3RYNHE4VHQzR3F4aXc&output=csv')
response.raise_for_status
rc = cStringIO.StringIO(response.content)

# with open('fields.csv', 'rb') as csvfile:
fieldreader = csv.reader(rc)
header = fieldreader.next()
for row in fieldreader:
    itemdict = {}
    for i in range(0,len(row)):
        itemdict[header[i]] = row[i]
        
    dwc_to_context_term[itemdict["field_dwc_term"]] = [itemdict["type_dict_key"], itemdict["field_master_term"]]
    solr_to_context_term[itemdict["field_solr_term"]] = [itemdict["type_dict_key"], itemdict["field_master_term"]]
    master_to_context[itemdict["field_master_term"]] = itemdict["type_dict_key"]
    if itemdict["type_dict_key"] in items:
        items[itemdict["type_dict_key"]]["fields"][itemdict["field_master_term"]] = itemdict
    else:
        items[itemdict["type_dict_key"]] = { "label": itemdict["type_label"], "order": itemdict["type_order"], "fields": {itemdict["field_master_term"]: itemdict } }

context_orders = {}
context_field_orders = {}
context_field_list = {}

for context in items.keys():
    context_orders[items[context]["order"]] = context
    context_field_orders[context] = {}
    for key in items[context]["fields"]:
        item = items[context]["fields"][key]
        context_field_orders[context][item["field_order"]] = item["field_master_term"]
    kl = [ int(k) for k in context_field_orders[context].keys() ]
    kl.sort()
    context_field_list[context] = [context_field_orders[context][str(x)] for x in kl]

#This needs to be sorted by number not lexically.
kl = [ int(k) for k in context_orders.keys() ]
kl.sort()
context_list = [context_orders[str(x)] for x in kl]          

# Hack in additional names
solr_to_context_term["dwc_scientificname_k"] = solr_to_context_term["dwc_scientificname_t"]
        
with open('fields.js.pytpl','r') as ffin:
    ffstr = ffin.read()
    ffstr = ffstr.format(json.dumps(context_field_list, sort_keys=True, indent=4 ),
    json.dumps(context_list, indent=4 ),
    json.dumps(dwc_to_context_term, indent=4 ),
    json.dumps(items, indent=4 ),
    json.dumps(master_to_context,  indent=4 ),
    json.dumps(solr_to_context_term, indent=4 ))
    with open('../public/js/fields.js', 'w') as ffout:
        ffout.write(ffstr)