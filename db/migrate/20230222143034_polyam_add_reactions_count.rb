# frozen_string_literal: true

require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class PolyamAddReactionsCount < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column :status_stats, :reactions_count, :bigint, default: 0, null: false }
  end

  def down
    remove_column :status_stats, :reactions_count
  end
end
