# frozen_string_literal: true

# This migration is only needed when Polyam-glitch was run before upstream implemented exclusive lists.
# The prior code allowed the `exclusive` column to be null.
class PolyamValidateExclusiveNotNull < ActiveRecord::Migration[6.1]
  def change
    return unless check_constraint_exists?(:lists, name: 'lists_exclusive_null')

    validate_check_constraint :lists, name: 'lists_exclusive_null'

    # The following lines are fine for Postgres 12+ environments, which every reasonable admin should run anyway
    # But vanilla enforces Postgres 10 compability, because they couldn't be arsed to update.
    # change_column_null :lists, :exclusive, false
    # remove_check_constraint :lists, name: 'lists_exclusive_null'
  end
end
