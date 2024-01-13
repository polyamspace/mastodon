# frozen_string_literal: true

# This migration is a duplicate of 20230605085710 and may get ignored.
# See: config/initializers/0_duplicate_migrations.rb

require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddExclusiveToLists < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column :lists, :exclusive, :boolean, default: false, null: false }
  end

  def down
    remove_column :lists, :exclusive
  end
end
