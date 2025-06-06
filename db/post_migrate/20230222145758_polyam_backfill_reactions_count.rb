# frozen_string_literal: true

class PolyamBackfillReactionsCount < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  class StatusReaction < ApplicationRecord; end

  def up
    safety_assured do
      StatusReaction.unscoped.in_batches do |reactions|
        execute <<-SQL.squish
          INSERT INTO status_stats (status_id, reactions_count, created_at, updated_at)
          SELECT DISTINCT ON (status_id) status_id, count(*), MIN(created_at) AS created_at, MAX(updated_at) AS updated_at
          FROM status_reactions WHERE status_id IN (#{reactions.map(&:status_id).uniq.join(', ')}) GROUP BY status_id
          ON CONFLICT (status_id) DO UPDATE
          SET reactions_count = EXCLUDED.reactions_count, created_at = LEAST(status_stats.created_at, EXCLUDED.created_at), updated_at = GREATEST(status_stats.updated_at, EXCLUDED.updated_at)
        SQL
      end
    end
  end

  def down; end
end
