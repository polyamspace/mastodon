# frozen_string_literal: true

class PolyamValidateExclusiveNotNull < ActiveRecord::Migration[6.1]
  def change
    validate_check_constraint :lists, name: 'lists_exclusive_null'

    # The following lines are fine for Postgres 12+ environments, which every reasonable admin should run anyway
    # But vanilla enforces Postgres 10 compability, because they couldn't be arsed to update.
    # change_column_null :lists, :exclusive, false
    # remove_check_constraint :lists, name: 'lists_exclusive_null'
  end
end
