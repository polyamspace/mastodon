# frozen_string_literal: true

namespace :assets do
  desc 'Generate static pages'
  task generate_static_pages: :environment do
    def render_static_page(action, dest:, **opts)
      renderer = Class.new(ApplicationController) do
        def current_user
          nil
        end

        def current_flavour
          Setting.default_settings['flavour']
        end

        def current_skin
          Setting.default_settings['skin']
        end

        def system_skins
          [Setting.default_settings['system_dark'], Setting.default_settings['system_light']]
        end
      end

      html = renderer.render(action, opts)
      File.write(dest, html)
    end

    render_static_page 'errors/500', layout: 'error', dest: Rails.public_path.join('assets', '500.html')
  end
end

if Rake::Task.task_defined?('assets:precompile')
  Rake::Task['assets:precompile'].enhance do
    Rake::Task['assets:generate_static_pages'].invoke
  end
end

# We don't want vite_ruby to run yarn, we do that in a separate step
Rake::Task['vite:install_dependencies'].clear
