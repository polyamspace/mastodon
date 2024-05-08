# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Settings::FlavoursController do
  let(:user) { Fabricate(:user) }

  before do
    sign_in user, scope: :user
  end

  describe 'PUT #update' do
    describe 'without a user[setting_skin] parameter' do
      it 'sets the selected flavour' do
        put :update, params: { flavour: 'schnozzberry' }

        user.reload

        expect(user.setting_flavour).to eq 'schnozzberry'
      end
    end

    describe 'with a user[setting_skin] parameter' do
      before do
        put :update, params: { flavour: 'schnozzberry', user: { setting_skin: 'wallpaper' } }

        user.reload
      end

      it 'sets the selected flavour' do
        expect(user.setting_flavour).to eq 'schnozzberry'
      end

      it 'sets the selected skin' do
        expect(user.setting_skin).to eq 'wallpaper'
      end
    end

    describe 'with a user[system_dark] parameter' do
      before do
        put :update, params: { flavour: 'schnozzberry', user: { setting_system_dark: 'wallpaper' } }

        user.reload
      end

      it 'sets the selected system dark skin' do
        expect(user.setting_system_dark).to eq 'wallpaper'
      end
    end

    describe 'with a user[system_light] parameter' do
      before do
        put :update, params: { flavour: 'schnozzberry', user: { setting_system_light: 'wallpaper' } }

        user.reload
      end

      it 'sets the selected system light skin' do
        expect(user.setting_system_light).to eq 'wallpaper'
      end
    end
  end
end
