# frozen_string_literal: true

class PolyamRemoveIsExclusiveList < ActiveRecord::Migration[6.1]
  def change
    safety_assured { remove_column :lists, :is_exclusive, :boolean, default: false }
  end
end
