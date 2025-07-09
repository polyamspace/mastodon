# frozen_string_literal: true

FRONTEND_PATHS = ['app/javascript/mastodon/locales', 'app/javascript/flavours/glitch/locales', 'app/javascript/flavours/polyam/locales'].freeze
BACKEND_PATHS = ['config/locales', 'config/locales-glitch', 'config/locales-polyam'].freeze

IGNORED_KEYS = ['dmca_address'].freeze

def get_key_value(hash, &block)
  hash.each do |k, v|
    if v.is_a? Hash
      get_key_value(v, &block)
    else
      yield(k, v)
    end
  end
end

namespace :tootkeeper do
  desc 'Check locale files for "post"'
  task check: :environment do
    error = false
    begin
      Rake::Task['tootkeeper:check_yml'].invoke
    rescue SystemExit
      error = true
    end
    begin
      Rake::Task['tootkeeper:check_json'].invoke
    rescue SystemExit
      error = true
    end
    exit(1) if error
  end

  desc 'Check frontend locales for "post"'
  task check_json: :environment do
    puts 'Checking json files...'
    pastel = Pastel.new
    matches = false
    Rails.root.glob(FRONTEND_PATHS.map { |a| "#{a}/en.json" }).map do |path|
      JSON.load_file(path).each do |k, v|
        next if k.in?(IGNORED_KEYS)

        if v.downcase.include?('post')
          matches = true
          puts pastel.red("#{path}: #{pastel.bold(k)} contains \"post\"")
        end
      end
    end
    abort if matches
    puts pastel.green('OK')
  end

  desc 'Check backend locales for "post"'
  task check_yml: :environment do
    puts 'Checking yml files...'
    pastel = Pastel.new
    matches = false
    Rails.root.glob(BACKEND_PATHS.map { |a| "#{a}/*en*.yml" }).map do |path|
      get_key_value(YAML.safe_load_file(path)) do |k, v|
        next if v.nil? || k.in?(IGNORED_KEYS)

        if v.downcase.include?('post')
          matches = true
          puts pastel.red("#{path}: #{pastel.bold(k)} contains \"post\"")
        end
      end
    end
    abort if matches
    puts pastel.green('OK')
  end
end
