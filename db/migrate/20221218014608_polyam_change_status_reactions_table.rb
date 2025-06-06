# frozen_string_literal: true

class PolyamChangeStatusReactionsTable < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  # Thanks to kescherCode
  def change
    remove_foreign_key :status_reactions, :accounts
    remove_foreign_key :status_reactions, :statuses
    remove_foreign_key :status_reactions, :custom_emojis
    add_foreign_key :status_reactions, :accounts, on_delete: :cascade, validate: false
    add_foreign_key :status_reactions, :statuses, on_delete: :cascade, validate: false
    add_foreign_key :status_reactions, :custom_emojis, on_delete: :cascade, validate: false
    validate_foreign_key :status_reactions, :accounts
    validate_foreign_key :status_reactions, :statuses
    validate_foreign_key :status_reactions, :custom_emojis
  end
end
