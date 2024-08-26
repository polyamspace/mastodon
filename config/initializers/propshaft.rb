# frozen_string_literal: true

# SVG icons
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'images')
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'svg-icons')

# Material Design icons
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'material-icons')

# Font Awesome icons
Rails.application.config.assets.paths << Rails.root.join('app', 'javascript', 'awesome-icons')
