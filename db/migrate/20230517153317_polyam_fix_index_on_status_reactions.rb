# frozen_string_literal: true

class PolyamFixIndexOnStatusReactions < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def change
    remove_index :status_reactions, column: [:account_id, :status_id, :name], unique: true
    add_index :status_reactions, [:account_id, :status_id, :name, :custom_emoji_id], unique: true, name: :index_status_reactions_on_account_id_and_status_id, algorithm: :concurrently
  end
end
