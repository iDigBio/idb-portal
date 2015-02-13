#using 2.1.1 with RVM 
require 'csv'
require 'json'
require 'mechanize'#gem
#require 'pry'

output = {}
url = 'https://docs.google.com/spreadsheet/ccc?key=0AvMqM-SMbq09dERsNkppX05Sd3RYNHE4VHQzR3F4aXc&output=csv'
client = Mechanize.new
resp = client.get(url)
#binding.pry
output['order'] = {}
output['names'] = {}
#output['sorder'] = []
#build order by type arrays 
#and name dict for label name resolution
CSV.parse(resp.body, :headers => true) do |row|
  unless output['order'].key? row['type_dict_key']
    output['order'][row['type_dict_key']] = []
    output['names'][row['type_dict_key']] = row['type_label']
    #output['sorder'][row['type_order'].to_i]=row['type_dict_key']
  end
  #out of order index assigning
  output['order'][row['type_dict_key']][row['field_order'].to_i] = row['field_dwc_term'].to_s.downcase
  output['names'][row['field_dwc_term'].to_s.downcase] = row['field_label'] 
end

File.open('../public/client/js/lib/dwc_fields.js','w') do |file|
  file.write "module.exports = " << output.to_json
end