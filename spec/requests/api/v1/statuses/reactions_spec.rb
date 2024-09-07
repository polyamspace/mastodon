# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Reactions', :inline_jobs do
  let(:user) { Fabricate(:user) }
  let(:scopes) { 'write:favourites' }
  # let(:app)   { Fabricate(:application, name: 'Test app', website: 'http://testapp.com') }
  let(:token) { Fabricate(:accessible_access_token, resource_owner_id: user.id, scopes: scopes) }
  let(:headers) { { 'Authorization' => "Bearer #{token.token}" } }

  describe 'POST /api/v1/statuses/:status_id/react/:id' do
    subject do
      # Emoji needs to be escaped here, otherwise this throws an InvalidURIError about not being ascii only
      post "/api/v1/statuses/#{status.id}/react/#{CGI.escape('👍')}", headers: headers
    end

    let(:status) { Fabricate(:status) }

    it_behaves_like 'forbidden for wrong scope', 'read read:favourites'

    context 'with public status' do
      it 'reacts to status successfully', :aggregate_failures do
        subject

        expect(response).to have_http_status(200)
        expect(user.account.reacted?(status, '👍')).to be true
      end

      it 'returns json with updated attributes' do
        subject

        expect(response.parsed_body).to match(a_hash_including(id: status.id.to_s, reactions_count: 1, reactions: [include(me: true)]))
      end
    end

    context 'with private status of not-followed account' do
      let(:status) { Fabricate(:status, visibility: :private) }

      it 'returns http not found' do
        subject

        expect(response).to have_http_status(404)
      end
    end

    context 'with private status of followed account' do
      let(:status) { Fabricate(:status, visibility: :private) }

      before do
        user.account.follow!(status.account)
      end

      it 'reacts to status successfully', :aggregate_failures do
        subject

        expect(response).to have_http_status(200)
        expect(user.account.reacted?(status, '👍')).to be true
      end
    end

    context 'without an authorization header' do
      let(:headers) { {} }

      it 'returns http unauthorized' do
        subject

        expect(response).to have_http_status(401)
      end
    end
  end

  describe 'POST /api/v1/statuses/:status_id/unreact/:id' do
    subject do
      # Emoji needs to be escaped here, otherwise throws an InvalidURIError about not being ascii only
      post "/api/v1/statuses/#{status.id}/unreact/#{CGI.escape('👍')}", headers: headers
    end

    let(:status) { Fabricate(:status) }

    it_behaves_like 'forbidden for wrong scope', 'read read:favourites'

    context 'with public status' do
      before do
        ReactService.new.call(user.account, status, '👍')
      end

      it 'unreacts to status successfully', :aggregate_failures do
        subject

        expect(response).to have_http_status(200)
        expect(user.account.reacted?(status, '👍')).to be false
      end

      it 'returns json with updated attributes' do
        subject

        expect(response.parsed_body).to match(a_hash_including(id: status.id.to_s, reactions_count: 0, reactions: []))
      end
    end

    context 'when requesting user was blocked by the status author' do
      before do
        ReactService.new.call(user.account, status, '👍')
        status.account.block!(user.account)
      end

      it 'unreacts the status successfully', :aggregate_failures do
        subject

        expect(response).to have_http_status(200)
        expect(user.account.reacted?(status, '👍')).to be false
      end

      it 'returns json with updated attributes' do
        subject

        expect(response.parsed_body).to match(a_hash_including(id: status.id.to_s, reactions_count: 0, reactions: []))
      end
    end

    context 'when status was not reacted to' do
      it 'returns http success' do
        subject

        expect(response).to have_http_status(200)
      end
    end

    context 'with private status that was not reacted to' do
      let(:status) { Fabricate(:status, visibility: :private) }

      it 'returns http not found' do
        subject

        expect(response).to have_http_status(404)
      end
    end
  end
end
