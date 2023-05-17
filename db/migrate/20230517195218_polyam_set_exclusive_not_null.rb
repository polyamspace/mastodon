# frozen_string_literal: true

class PolyamSetExclusiveNotNull < ActiveRecord::Migration[6.1]
  def change
    add_check_constraint :lists, 'exclusive IS NOT NULL', name: 'lists_exclusive_null', validate: false
  end
end
