# frozen_string_literal: true

require 'singleton'
require 'yaml'

class Themes
  include Singleton

  DISABLED_THEMES = ENV.fetch('DISABLED_SKINS', '').split(/\s*,\s*/).delete_if { |s| %w(system application mastodon-light).include?(s) }

  THEME_COLORS = {
    dark: '#181820',
    light: '#ffffff',
  }.freeze

  def initialize
    @flavours = {}

    Rails.root.glob('app/javascript/flavours/*/theme.yml') do |pathname|
      data = YAML.load_file(pathname)
      next unless data['pack_directory']

      dir = pathname.dirname
      name = dir.basename.to_s
      locales = []
      screenshots = []

      # Skip vanilla flavour
      next if name == 'vanilla' && ENV['ENABLE_VANILLA'] != 'true'

      if data['locales']
        Dir.glob(File.join(dir, data['locales'], '*.{js,json}')) do |locale|
          locale_name = File.basename(locale, File.extname(locale))
          locales.push(locale_name) unless /defaultMessages|whitelist|index/.match?(locale_name)
        end
      end

      if data['screenshot']
        if data['screenshot'].is_a? Array
          screenshots = data['screenshot']
        else
          screenshots.push(data['screenshot'])
        end
      end

      data['name'] = name
      data['locales'] = locales
      data['screenshot'] = screenshots
      data['skins'] = []
      @flavours[name] = data
    end

    Rails.root.glob('app/javascript/skins/*/*') do |pathname|
      ext = pathname.extname.to_s
      skin = pathname.basename.to_s
      name = pathname.dirname.basename.to_s
      next unless @flavours[name]

      next if DISABLED_THEMES.include?(pathname.basename('.scss').to_s)

      if pathname.directory?
        @flavours[name]['skins'] << skin if pathname.glob('{common,index,application}.{css,scss}').any?
      elsif /^\.s?css$/i.match?(ext)
        @flavours[name]['skins'] << pathname.basename(ext).to_s
      end
    end
  end

  def flavour(name)
    @flavours[name]
  end

  def flavours
    @flavours.keys
  end

  def skins_for(name)
    skins = @flavours[name]['skins']
    skins.include?('application') && skins.include?('mastodon-light') ? ['system'] + skins : skins
  end

  def flavours_and_skins
    flavours.map do |flavour|
      [flavour, skins_for(flavour).map { |skin| [flavour, skin] }]
    end
  end
end
