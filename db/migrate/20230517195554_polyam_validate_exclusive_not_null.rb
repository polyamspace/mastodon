# frozen_string_literal: true

class PolyamValidateExclusiveNotNull < ActiveRecord::Migration[6.1]
  def change
    validate_check_constraint :lists, name: 'lists_exclusive_null'
    change_column_null :lists, :exclusive, false
    remove_check_constraint :lists, name: 'lists_exclusive_null'
  end
end
