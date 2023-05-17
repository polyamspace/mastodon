# frozen_string_literal: true

class AddIsExclusiveToList < ActiveRecord::Migration[6.1]
  def change
    add_column :lists, :is_exclusive, :boolean, default: false # rubocop:disable Rails/ThreeStateBooleanColumn
  end
end
