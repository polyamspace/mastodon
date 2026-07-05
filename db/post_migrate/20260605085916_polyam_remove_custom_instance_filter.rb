# frozen_string_literal: true

class PolyamRemoveCustomInstanceFilter < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  # Dummy class, to make migration possible across version changes
  class CustomFilter < ApplicationRecord
    INSTANCE_FILTER_ID = -99
  end

  def up
    instance_filter = CustomFilter.find_by(id: CustomFilter::INSTANCE_FILTER_ID)
    return unless instance_filter

    instance_filter.destroy!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
