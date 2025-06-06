# frozen_string_literal: true

class PolyamRemoveExclusiveCheckConstraint < ActiveRecord::Migration[8.0]
  def change
    change_column_null :lists, :exclusive, false if column_exists?(:lists, :exclusive, null: true)

    return unless check_constraint_exists?(:lists, name: 'lists_exclusive_null')

    remove_check_constraint :lists, name: 'lists_exclusive_null'
  end
end
