# frozen_string_literal: true

module ThemingConcern
  extend ActiveSupport::Concern

  private

  def current_flavour
    @current_flavour ||= [current_user&.setting_flavour, Setting.flavour, 'glitch', 'vanilla', 'polyam'].find { |flavour| Themes.instance.flavours.include?(flavour) }
  end

  def current_skin
    @current_skin ||= begin
      skins = Themes.instance.skins_for(current_flavour)
      [current_user&.setting_skin, Setting.skin, 'system', 'application'].find { |skin| skins.include?(skin) }
    end
  end

  def system_skins
    @system_skins ||= begin
      skins = Themes.instance.skins_for(current_flavour)
      system_dark = [current_user&.setting_system_dark, Setting.system_dark, 'application'].find { |skin| skins.include?(skin) }
      system_light = [current_user&.setting_system_light, Setting.system_light, 'mastodon-light'].find { |skin| skins.include?(skin) }
      [system_dark, system_light]
    end
  end

  def current_theme
    # NOTE: this is slightly different from upstream, as it's a derived value used
    # for the sole purpose of pointing to the appropriate stylesheet pack
    [current_flavour, current_skin] + system_skins
  end
end
