# frozen_string_literal: true

class BackfillReactionsCount < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    safety_assured do
      execute <<-SQL.squish
        INSERT INTO status_stats (status_id, reactions_count, updated_at, created_at)
        SELECT DISTINCT ON (r.status_id) r.status_id, count(*), MIN(j.created_at) AS created_at, MAX(j.updated_at) AS updated_at
        FROM status_reactions r, status_reactions j WHERE r.status_id = j.status_id GROUP BY r.status_id, r.updated_at, r.created_at
        ON CONFLICT (status_id) DO UPDATE
        SET reactions_count = EXCLUDED.reactions_count, updated_at = greatest(status_stats.updated_at, EXCLUDED.updated_at), created_at = least(status_stats.created_at, EXCLUDED.created_at)
      SQL
    end
  end

  def down; end
end
