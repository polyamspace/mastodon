# frozen_string_literal: true

class Admin::Metrics::Dimension::ConfigDimension < Admin::Metrics::Dimension::BaseDimension
  include Redisable

  def key
    'config'
  end

  def data
    [search_enabled, single_user_mode, authorized_fetch, whitelist_mode, hidden_service]
  end

  private

  def authorized_fetch
    value = ENV['AUTHORIZED_FETCH'] == 'true'

    {
      key: 'authorized_fetch',
      human_key: I18n.t('admin.dashboard.authorized_fetch_mode'),
      value: value,
      human_value: to_enabled(value),
    }
  end

  def whitelist_mode
    value = Rails.configuration.x.whitelist_mode

    {
      key: 'whitelist_mode',
      human_key: I18n.t('admin.dashboard.whitelist_mode'),
      value: value,
      human_value: to_enabled(value),
    }
  end

  def single_user_mode
    value = Rails.configuration.x.single_user_mode

    {
      key: 'single_user_mode',
      human_key: I18n.t('admin.dashboard.single_user_mode'),
      value: value,
      human_value: to_enabled(value),
    }
  end

  def hidden_service
    value = ENV['ALLOW_ACCESS_TO_HIDDEN_SERVICE'] == 'true'

    {
      key: 'hidden_service',
      human_key: I18n.t('admin.dashboard.hidden_service'),
      value: value,
      human_value: to_enabled(value),
    }
  end

  def search_enabled
    value = Chewy.enabled?

    {
      key: 'search',
      human_key: I18n.t('admin.dashboard.search'),
      value: value,
      human_value: to_enabled(value),
    }
  end

  def to_enabled(value)
    value ? I18n.t('admin.custom_emojis.enabled') : I18n.t('admin.custom_emojis.disabled')
  end
end
