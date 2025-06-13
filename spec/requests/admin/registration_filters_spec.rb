# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin Registration Filters' do
  describe 'POST /admin/registration_filters/new' do
    before { sign_in Fabricate(:admin_user) }

    it 'gracefully handles invalid nested params' do
      post admin_email_domain_blocks_path(phrase: 'invalid')

      expect(response)
        .to have_http_status(400)
    end
  end
end
