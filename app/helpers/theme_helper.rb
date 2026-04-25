# frozen_string_literal: true

module ThemeHelper
  def javascript_inline_tag(path)
    entry = InlineScriptManager.instance.file(path)

    # Only add hash if we don't allow arbitrary includes already, otherwise it's going
    # to break the React Tools browser extension or other inline scripts
    unless Rails.env.development? && request.content_security_policy.dup.script_src.include?("'unsafe-inline'")
      request.content_security_policy = request.content_security_policy.clone.tap do |policy|
        values = policy.script_src
        values << "'sha256-#{entry[:digest]}'"
        policy.script_src(*values)
      end
    end

    content_tag(:script, entry[:contents], type: 'text/javascript')
  end

  def theme_style_tags(flavour_and_skin)
    flavour, theme, dark, light = flavour_and_skin
    dark ||= 'default'
    light ||= 'default'

    # Polyam: Kept from upstream as otherwise custom dark/light skins aren't loaded
    if theme == 'default' && !(dark == 'default' && light == 'default')
      ''.html_safe.tap do |tags|
        tags << vite_stylesheet_tag("skins/#{flavour}/#{light}", type: :virtual, media: 'not all and (prefers-color-scheme: dark)', crossorigin: 'anonymous')
        tags << vite_stylesheet_tag("skins/#{flavour}/#{dark}", type: :virtual, media: '(prefers-color-scheme: dark)', crossorigin: 'anonymous')
      end
    else
      vite_stylesheet_tag "skins/#{flavour}/#{theme}", type: :virtual, media: 'all', crossorigin: 'anonymous'
    end
  end

  def theme_color_tags(color_scheme)
    case color_scheme
    when 'auto'
      ''.html_safe.tap do |tags|
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:dark], media: '(prefers-color-scheme: dark)')
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:light], media: '(prefers-color-scheme: light)')
      end
    when 'light'
      tag.meta name: 'theme-color', content: Themes::THEME_COLORS[:light]
    when 'dark'
      tag.meta name: 'theme-color', content: Themes::THEME_COLORS[:dark]
    end
  end

  def custom_stylesheet
    return if active_custom_stylesheet.blank?

    stylesheet_link_tag(
      custom_css_path(active_custom_stylesheet),
      host: root_url,
      media: :all,
      skip_pipeline: true
    )
  end

  def current_flavour
    [current_user&.setting_flavour, Setting.flavour, 'glitch', 'vanilla', 'polyam'].find { |flavour| Themes.instance.flavours.include?(flavour) }
  end

  def current_skin
    skins = Themes.instance.skins_for(current_flavour)
    [current_user&.setting_skin, Setting.skin, 'default'].find { |skin| skins.include?(skin) }
  end

  def system_skins
    @system_skins ||= begin
      skins = Themes.instance.skins_for(current_flavour)
      system_dark = [current_user&.setting_system_dark, Setting.system_dark, 'default'].find { |skin| skins.include?(skin) }
      system_light = [current_user&.setting_system_light, Setting.system_light, 'default'].find { |skin| skins.include?(skin) }
      [system_dark, system_light]
    end
  end

  def current_theme
    # NOTE: this is slightly different from upstream, as it's a derived value used
    # for the sole purpose of pointing to the appropriate stylesheet pack
    [current_flavour, current_skin] + system_skins
  end

  def color_scheme
    current_user&.setting_color_scheme || 'auto'
  end

  def contrast
    current_user&.setting_contrast || 'auto'
  end

  def page_color_scheme
    content_for(:force_color_scheme).presence || color_scheme
  end

  private

  def active_custom_stylesheet
    return if cached_custom_css_digest.blank?

    [:custom, cached_custom_css_digest.to_s.first(8)]
      .compact_blank
      .join('-')
  end

  def cached_custom_css_digest
    Rails.cache.fetch(:setting_digest_custom_css) do
      Setting.custom_css&.then { |content| Digest::SHA256.hexdigest(content) }
    end
  end
end
