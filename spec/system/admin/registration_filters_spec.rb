# frozen_string_literal: true

# This spec covers polyam-glitch's request text filters

require 'rails_helper'

RSpec.describe 'Admin::RegistrationFilters' do
  before do
    sign_in Fabricate(:admin_user), scope: :user
  end

  describe 'Viewing registration filters' do
    it 'can view registration filters' do
      filter = Fabricate(:registration_filter, phrase: 'test')
      visit admin_registration_filters_path

      expect(page)
        .to have_content(filter.phrase)
        .and have_content(I18n.t('admin.registration_filters.types.text'))
    end
  end

  describe 'Creating registration filters' do
    it 'creates new registration filter' do
      visit admin_registration_filters_path
      click_on I18n.t('admin.registration_filters.add_new')

      expect(page)
        .to have_content(I18n.t('admin.registration_filters.new.title'))

      fill_in I18n.t('admin.registration_filters.phrase'), with: 'bitcoin'

      expect { submit_create }
        .to change(RegistrationFilter.where(phrase: 'bitcoin'), :count).by(1)

      expect(page)
        .to have_content(I18n.t('admin.registration_filters.title'))
        .and have_content(I18n.t('admin.registration_filters.created_msg'))
    end

    def submit_create
      click_on I18n.t('admin.registration_filters.new.create')
    end
  end

  describe 'Managing existing registration filters' do
    it 'updates registration filter' do
      filter = Fabricate(:registration_filter, phrase: 'test')
      visit admin_registration_filters_path

      click_on I18n.t('filters.edit.title')

      expect(page)
        .to have_content(I18n.t('admin.registration_filters.edit.title'))

      fill_in I18n.t('admin.registration_filters.phrase'), with: 'changed'

      expect { click_on submit_button }
        .to(change { filter.reload.phrase })

      expect(page)
        .to have_content(I18n.t('admin.registration_filters.title'))
        .and have_content(I18n.t('admin.registration_filters.updated_msg'))
    end

    it 'deletes registration filter' do
      Fabricate(:registration_filter)
      visit admin_registration_filters_path

      expect { delete_filter }
        .to change(RegistrationFilter, :count).by(-1)

      expect(page)
        .to have_content(I18n.t('admin.registration_filters.destroyed_msg'))
    end

    def delete_filter
      click_on I18n.t('generic.delete')
    end
  end
end
