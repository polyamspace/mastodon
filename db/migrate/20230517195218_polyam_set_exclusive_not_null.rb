# frozen_string_literal: true

# This migration is only needed when Polyam-glitch was run before upstream implemented exclusive lists.
# The prior code allowed the `exclusive` column to be null.
class PolyamSetExclusiveNotNull < ActiveRecord::Migration[6.1]
  def change
    return if column_exists?(:lists, :exclusive, null: false)

    add_check_constraint :lists, 'exclusive IS NOT NULL', name: 'lists_exclusive_null', validate: false
  end
end
