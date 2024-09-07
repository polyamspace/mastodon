# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'API V1 Statuses Reacted By Accounts' do
  let(:user) { Fabricate(:user) }
  # let(:app) { Fabricate(:application, name: 'Test app', website: 'http://testapp.com') }
  let(:scopes) { 'read:accounts' }
  let(:token) { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: scopes) }
  let(:headers) { { 'Authorization' => "Bearer #{token.token}" } }
  let(:alice) { Fabricate(:account) }
  let(:bob) { Fabricate(:account) }

  context 'with an oauth token' do
    subject do
      get "/api/v1/statuses/#{status.id}/reacted_by", headers: headers, params: { limit: 2 }
    end

    describe 'GET /api/v1/statuses/:status_id/reacted_by' do
      let(:status) { Fabricate(:status, account: user.account) }

      before do
        Fabricate(:status_reaction, account: alice, status: status)
        Fabricate(:status_reaction, account: bob, status: status)
      end

      it 'returns http success and accounts who reacted to the status' do
        subject

        expect(response).to have_http_status(:success)
        expect(response.headers['Link'].links.size).to eq(2)

        expect(response.parsed_body.size).to eq(2)
        expect(response.parsed_body).to contain_exactly(include(id: alice.id.to_s), include(id: bob.id.to_s))
      end

      it 'does not return blocked users' do
        user.account.block!(bob)

        subject

        expect(response.parsed_body.size).to eq 1
        expect(response.parsed_body.first[:id]).to eq(alice.id.to_s)
      end
    end
  end

  context 'without an oauth token' do
    subject do
      get "/api/v1/statuses/#{status.id}/reacted_by", params: { limit: 2 }
    end

    context 'with a private status' do
      let(:status) { Fabricate(:status, account: user.account, visibility: :private) }

      describe 'GET #index' do
        before do
          Fabricate(:status_reaction, account: user.account, status: status)
        end

        it 'returns http unauthorized' do
          subject

          expect(response).to have_http_status(:missing)
        end
      end
    end

    context 'with a public status' do
      let(:status) { Fabricate(:status, account: user.account, visibility: :public) }

      describe 'GET #index' do
        before do
          Fabricate(:status_reaction, account: user.account, status: status)
        end

        it 'returns http success' do
          subject

          expect(response).to have_http_status(:success)
        end
      end
    end
  end
end
