# frozen_string_literal: true

class PolyamRemoveSystemSkinSettings < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  # Dummy classes, to make migration possible across version changes
  class User < ApplicationRecord; end

  def up
    # Remove the admin setting
    connection.execute(<<~SQL.squish)
      DELETE FROM settings
      WHERE var IN ('system_dark', 'system_light')
    SQL

    # Remove the user setting
    User.where.not(settings: nil).find_each do |user|
      settings = JSON.parse(user.attributes_before_type_cast['settings'])
      next if settings.nil?

      setting_needs_update = false

      unless settings['system_dark'].nil?
        settings.delete('system_dark')
        setting_needs_update = true
      end

      unless settings['system_light'].nil?
        settings.delete('system_light')
        setting_needs_update = true
      end

      user.update_column('settings', JSON.generate(settings)) if setting_needs_update
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
