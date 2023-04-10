# frozen_string_literal: true

class AddIsExclusiveToList < ActiveRecord::Migration[6.1]
  def change
    add_column :lists, :is_exclusive, :boolean
    change_column_default :lists, :is_exclusive, false
  end
end
