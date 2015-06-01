require 'spec_helper'

describe "viewer goes to search page" do
	before :each do
		Capybara.default_driver = :webkit
		Capybara.javascript_driver = :webkit
		Capybara.default_wait_time = 5
		visit('https://beta-portal.idigbio.org/portal/search')
	end

	context "it loads the search page" do
		it "and enters some text in the genus box", :js => true do 
			expect(page).to have_content('Start Searching')
			within('#genus-filter') do
				fill_in 'genus', :with => 'acer'
			end
		end
	end 
end