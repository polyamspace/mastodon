# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Accounts Pins API' do
  let(:user)     { Fabricate(:user) }
  let(:token)    { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: scopes) }
  let(:scopes)   { 'write:accounts' }
  let(:headers)  { { 'Authorization' => "Bearer #{token.token}" } }
  let(:kevin) { Fabricate(:user) }
  let(:john) { Fabricate(:user) }

  before do
    kevin.account.followers << user.account
  end

  describe 'GET /api/v1/accounts/:account_id/pinned' do
    subject do
      get "/api/v1/accounts/#{john.account.id}/pinned", params: { limit: 1 }, headers: headers
    end

    let(:scopes) { '' }

    before do
      john.account.followers << kevin.account
      Fabricate(:account_pin, account: john.account, target_account: kevin.account)
    end

    it 'returns pinned accounts', :aggregate_failures do
      subject

      expect(response).to have_http_status(200)
      expect(response.parsed_body[0][:id]).to eq kevin.account.id.to_s
    end

    context 'when requesting user is blocked' do
      before do
        john.account.block!(user.account)
      end

      it 'hides results' do
        subject

        expect(response).to have_http_status(200)
        expect(response.parsed_body.size).to eq 0
      end
    end
  end

  describe 'POST /api/v1/accounts/:account_id/pin' do
    subject { post "/api/v1/accounts/#{kevin.account.id}/pin", headers: headers }

    it 'creates account_pin', :aggregate_failures do
      expect do
        subject
      end.to change { AccountPin.where(account: user.account, target_account: kevin.account).count }.by(1)
      expect(response).to have_http_status(200)
    end
  end

  describe 'POST /api/v1/accounts/:account_id/unpin' do
    subject { post "/api/v1/accounts/#{kevin.account.id}/unpin", headers: headers }

    before do
      Fabricate(:account_pin, account: user.account, target_account: kevin.account)
    end

    it 'destroys account_pin', :aggregate_failures do
      expect do
        subject
      end.to change { AccountPin.where(account: user.account, target_account: kevin.account).count }.by(-1)
      expect(response).to have_http_status(200)
    end
  end
end
