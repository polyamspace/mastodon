# frozen_string_literal: true

require 'rails_helper'

describe 'Instances' do
  let(:user)    { Fabricate(:user) }
  let(:token)   { Fabricate(:accessible_access_token, resource_owner_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token.token}" } }

  describe 'GET /api/v2/instance' do
    context 'when logged out' do
      it 'returns http success and json' do
        get api_v2_instance_path

        expect(response)
          .to have_http_status(200)

        expect(body_as_json)
          .to be_present
          .and include(title: Setting.site_title)
      end
    end

    context 'when logged in' do
      it 'returns http success and json' do
        get api_v2_instance_path, headers: headers

        expect(response)
          .to have_http_status(200)

        expect(body_as_json)
          .to be_present
          .and include(title: Setting.site_title)
      end
    end
  end
end
