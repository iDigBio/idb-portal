require 'csv'
require 'json'

js={}
CSV.foreach("charts.csv") do |row|
    js[row[1]]=row[0];
end

puts js.to_json