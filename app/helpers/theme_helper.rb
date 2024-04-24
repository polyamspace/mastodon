# frozen_string_literal: true

module ThemeHelper
  def theme_style_tags(theme)
    Rails.logger.warn(theme)
    if theme[:skin] == 'system'
      concat stylesheet_pack_tag("skins/#{theme[:flavour]}/mastodon-light/#{theme[:pack]}", media: 'not all and (prefers-color-scheme: dark)', crossorigin: 'anonymous')
      concat stylesheet_pack_tag("flavours/#{theme[:flavour]}/#{theme[:pack]}", media: '(prefers-color-scheme: dark)', crossorigin: 'anonymous')
    else
      stylesheet_pack_tag("skins/#{theme[:flavour]}/#{theme[:skin]}/#{theme[:pack]}", media: 'all', crossorigin: 'anonymous')
    end
  end

  def theme_color_tags(theme)
    if theme[:skin] == 'system'
      concat tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:dark], media: '(prefers-color-scheme: dark)')
      concat tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:light], media: '(prefers-color-scheme: light)')
    else
      tag.meta name: 'theme-color', content: theme_color_for(theme)
    end
  end

  private

  def theme_color_for(theme)
    theme[:skin] == 'mastodon-light' ? Themes::THEME_COLORS[:light] : Themes::THEME_COLORS[:dark]
  end
end
