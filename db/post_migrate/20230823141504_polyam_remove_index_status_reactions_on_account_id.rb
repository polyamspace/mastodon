# frozen_string_literal: true

class PolyamRemoveIndexStatusReactionsOnAccountId < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def change
    remove_index :status_reactions, column: [:account_id], name: :index_status_reactions_on_account_id
  end
end
