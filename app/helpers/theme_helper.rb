# frozen_string_literal: true

module ThemeHelper
  def theme_style_tags(flavour_and_skin)
    flavour, theme, dark, light = flavour_and_skin

    if theme == 'system'
      ''.html_safe.tap do |tags|
        tags << stylesheet_pack_tag("skins/#{flavour}/#{light}", media: 'not all and (prefers-color-scheme: dark)', crossorigin: 'anonymous')
        tags << stylesheet_pack_tag("skins/#{flavour}/#{dark}", media: '(prefers-color-scheme: dark)', crossorigin: 'anonymous')
      end
    else
      stylesheet_pack_tag "skins/#{flavour}/#{theme}", media: 'all', crossorigin: 'anonymous'
    end
  end

  def theme_color_tags(flavour_and_skin)
    _, theme, _, light = flavour_and_skin

    if theme == 'system'
      ''.html_safe.tap do |tags|
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:dark], media: '(prefers-color-scheme: dark)')
        tags << tag.meta(name: 'theme-color', content: Themes::THEME_COLORS[:light], media: '(prefers-color-scheme: light)')
      end
    else
      tag.meta name: 'theme-color', content: theme_color_for(theme, light)
    end
  end

  private

  def theme_color_for(theme, light)
    # TODO: Set theme colors for custom skins
    theme == light ? Themes::THEME_COLORS[:light] : Themes::THEME_COLORS[:dark]
  end
end
