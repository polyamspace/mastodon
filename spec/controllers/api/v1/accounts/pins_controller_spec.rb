# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::Accounts::PinsController do
  # What's this for?
  render_views

  let(:account) { Fabricate(:account) }
  let(:john)  { Fabricate(:user) }
  let(:kevin) { Fabricate(:user) }
  let(:token) { Fabricate(:accessible_access_token, resource_owner_id: john.id, scopes: 'write:accounts') }

  before do
    kevin.account.followers << john.account
    allow(controller).to receive(:doorkeeper_token) { token }
  end

  describe 'GET #index' do
    before do
      account.follow!(kevin.account)
      Fabricate(:account_pin, account: account, target_account: kevin.account)
    end

    it 'returns accounts pinned by the given account', :aggregate_failures do
      get :index, params: { account_id: account.id, limit: 1 }

      expect(response).to have_http_status(200)
      expect(body_as_json.size).to eq 1
      expect(body_as_json[0][:id]).to eq kevin.account.id.to_s
    end

    context 'when requesting user is blocked' do
      before do
        account.block!(john.account)
      end

      it 'hides results' do
        get :index, params: { account_id: account.id, limit: 1 }

        expect(response).to have_http_status(200)
        expect(body_as_json.size).to eq 0
      end
    end
  end

  describe 'POST #create' do
    subject { post :create, params: { account_id: kevin.account.id } }

    it 'creates account_pin', :aggregate_failures do
      expect do
        subject
      end.to change { AccountPin.where(account: john.account, target_account: kevin.account).count }.by(1)
      expect(response).to have_http_status(200)
    end
  end

  describe 'DELETE #destroy' do
    subject { delete :destroy, params: { account_id: kevin.account.id } }

    before do
      Fabricate(:account_pin, account: john.account, target_account: kevin.account)
    end

    it 'destroys account_pin', :aggregate_failures do
      expect do
        subject
      end.to change { AccountPin.where(account: john.account, target_account: kevin.account).count }.by(-1)
      expect(response).to have_http_status(200)
    end
  end
end
