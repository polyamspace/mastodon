# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Custom CSS' do
  include RoutingHelper

  describe 'GET /css/:id.css' do
    context 'without any CSS or User Roles' do
      it 'returns empty stylesheet' do
        get '/css/custom-123.css'

        expect(response)
          .to have_http_status(200)
          .and have_cacheable_headers
          .and have_attributes(
            content_type: match('text/css')
          )
        expect(response.body.presence)
          .to be_nil
      end
    end

    context 'with CSS settings' do
      before do
        Setting.custom_css = expected_css
      end

      it 'returns stylesheet from settings' do
        get '/css/custom-456.css'

        expect(response)
          .to have_http_status(200)
          .and have_cacheable_headers
          .and have_attributes(
            content_type: match('text/css')
          )
        expect(response.body.strip)
          .to eq(expected_css)
      end

      def expected_css
        <<~CSS.strip
          body { background-color: red; }
        CSS
      end
    end

    context 'with highlighted colored UserRole records' do
      before do
        _highlighted_colored = Fabricate :user_role, highlighted: true, color: '#336699', id: '123_123_123'
        _highlighted_no_color = Fabricate :user_role, highlighted: true, color: ''
        _no_highlight_with_color = Fabricate :user_role, highlighted: false, color: ''
      end

      it 'returns stylesheet from settings' do
        get '/custom.css'

        expect(response)
          .to have_http_status(200)
          .and have_cacheable_headers
          .and have_attributes(
            content_type: match('text/css')
          )
        expect(response.body.strip)
          .to eq(expected_css)
      end

      def expected_css
        <<~CSS.strip
          .user-role-123123123 {
            --user-role-accent: #336699;
            --user-role-background: #33669939;
            --user-role-border: #336699;
          }
        CSS
      end
    end
  end
end
