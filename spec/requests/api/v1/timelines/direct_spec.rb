# frozen_string_literal: true

require 'rails_helper'

describe 'API V1 Timelines Direct' do
  let(:user) { Fabricate(:user) }
  let(:scopes) { 'read:statuses' }
  let(:token) { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: scopes) }
  let(:headers) { { 'Authorization' => "Bearer #{token.token}" } }

  # TODO: This needs better coverage
  describe 'GET /api/v1/timelines/direct' do
    subject do
      get '/api/v1/timelines/direct', headers: headers
    end

    it_behaves_like 'forbidden for wrong scope', 'write write:statuses'

    it 'returns 200' do
      subject

      expect(response).to have_http_status(200)
    end
  end
end
