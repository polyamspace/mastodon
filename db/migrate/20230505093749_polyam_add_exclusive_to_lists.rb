# frozen_string_literal: true

# This migration is a duplicate of 20230605085710

class PolyamAddExclusiveToLists < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    return if column_exists?(:lists, :exclusive)

    safety_assured { add_column :lists, :exclusive, :boolean, default: false, null: false }
  end

  def down; end
end
