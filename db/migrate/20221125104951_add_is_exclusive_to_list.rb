# frozen_string_literal: true

require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddIsExclusiveToList < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column :lists, :is_exclusive, :boolean, default: false, null: false }
  end

  def down
    remove_column :lists, :is_exclusive
  end
end
