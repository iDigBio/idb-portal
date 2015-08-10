#using 2.1.1 with RVM 
require 'csv'
require 'json'
require 'mechanize'#gem
#require 'pry'

output = {}
url = 'https://docs.google.com/spreadsheet/ccc?key=1FJl00xFyathhdwZI9wMI0qr1QhJt_sEW2z68B_ZhNF4&output=csv'
client = Mechanize.new
resp = client.get(url)
#binding.pry

#output['sorder'] = []
#build order by type arrays 
#and name dict for label name resolution
CSV.parse(resp.body) do |row|
  output[row[0]] = row[1]
end

File.open('../public/client/js/lib/dq_flags.js','w') do |file|
  file.write "module.exports = " << output.to_json
end