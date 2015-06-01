require 'capybara'
require 'capybara/rspec'
require 'capybara-webkit'


RSpec.configure do |config|
	config.include Capybara::DSL
	config.include RSpec::Matchers 
end