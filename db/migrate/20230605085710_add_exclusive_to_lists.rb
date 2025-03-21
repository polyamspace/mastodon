# frozen_string_literal: true

# This migration is a duplicate of 20230505093749

class AddExclusiveToLists < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    return if column_exists?(:lists, :exclusive)

    safety_assured { add_column :lists, :exclusive, :boolean, default: false, null: false }
  end

  def down
    remove_column :lists, :exclusive
  end
end
