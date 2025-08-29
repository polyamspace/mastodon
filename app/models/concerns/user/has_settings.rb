# frozen_string_literal: true

module User::HasSettings
  extend ActiveSupport::Concern

  included do
    serialize :settings, coder: UserSettingsSerializer
  end

  def settings_attributes=(attributes)
    settings.update(attributes)
  end

  def prefers_noindex?
    settings['noindex']
  end

  def preferred_posting_language
    valid_locale_cascade(settings['default_language'], locale, I18n.locale)
  end

  def setting_auto_play_gif
    settings['web.auto_play']
  end

  def setting_default_sensitive
    settings['default_sensitive']
  end

  def setting_boost_modal
    settings['web.reblog_modal']
  end

  def setting_delete_modal
    settings['web.delete_modal']
  end

  def setting_favourite_modal
    settings['web.favourite_modal']
  end

  def setting_reduce_motion
    settings['web.reduce_motion']
  end

  def setting_system_font_ui
    settings['web.use_system_font']
  end

  def setting_system_emoji_font
    settings['web.use_system_emoji_font']
  end

  def setting_system_scrollbars_ui
    settings['web.use_system_scrollbars']
  end

  def setting_noindex
    settings['noindex']
  end

  def setting_norss
    settings['norss']
  end

  def setting_flavour
    settings['flavour']
  end

  def setting_skin
    settings['skin']
  end

  def setting_system_dark
    settings['system_dark']
  end

  def setting_system_light
    settings['system_light']
  end

  def setting_display_media
    settings['web.display_media']
  end

  def setting_expand_spoilers
    settings['web.expand_content_warnings']
  end

  def setting_default_language
    settings['default_language']
  end

  def setting_aggregate_reblogs
    settings['aggregate_reblogs']
  end

  def setting_visible_reactions
    integer_cast_setting('web.visible_reactions', 0)
  end

  def setting_show_application
    settings['show_application']
  end

  def setting_advanced_layout
    settings['web.advanced_layout']
  end

  def setting_use_blurhash
    settings['web.use_blurhash']
  end

  def setting_use_pending_items
    settings['web.use_pending_items']
  end

  def setting_trends
    settings['web.trends']
  end

  def setting_disable_swiping
    settings['web.disable_swiping']
  end

  def setting_disable_hover_cards
    settings['web.disable_hover_cards']
  end

  def setting_always_send_emails
    settings['always_send_emails']
  end

  def setting_default_privacy
    settings['default_privacy'] || (account.locked? ? 'private' : 'public')
  end

  def setting_default_content_type
    settings['default_content_type']
  end

  def setting_hide_followers_count
    settings['hide_followers_count']
  end

  # Polyam
  def setting_notification_sound
    settings['web.notification_sound']
  end

  def setting_default_quote_policy
    settings['default_quote_policy'] || 'public'
  end

  def allows_report_emails?
    settings['notification_emails.report']
  end

  def allows_pending_account_emails?
    settings['notification_emails.pending_account']
  end

  def allows_appeal_emails?
    settings['notification_emails.appeal']
  end

  def allows_trends_review_emails?
    settings['notification_emails.trends']
  end

  def allows_trending_tags_review_emails?
    settings['notification_emails.trends']
  end

  def allows_trending_links_review_emails?
    settings['notification_emails.link_trends']
  end

  def allows_trending_statuses_review_emails?
    settings['notification_emails.status_trends']
  end

  def aggregates_reblogs?
    settings['aggregate_reblogs']
  end

  def shows_application?
    settings['show_application']
  end

  def show_all_media?
    settings['web.display_media'] == 'show_all'
  end

  def hide_all_media?
    settings['web.display_media'] == 'hide_all'
  end

  def integer_cast_setting(key, min = nil, max = nil)
    i = ActiveModel::Type::Integer.new.cast(settings[key])
    # the cast above doesn't return a number if passed the string "e"
    i = 0 unless i.is_a? Numeric
    return min if !min.nil? && i < min
    return max if !max.nil? && i > max

    i
  end
end
