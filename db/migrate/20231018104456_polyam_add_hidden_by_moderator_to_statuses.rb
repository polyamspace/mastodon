# frozen_string_literal: true

require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class PolyamAddHiddenByModeratorToStatuses < ActiveRecord::Migration[7.0]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column_with_default :statuses, :hidden_by_moderator, :boolean, default: false, allow_null: false }
  end

  def down
    remove_column :statuses, :hidden_by_moderator
  end
end
