class BackfillReactionsCount < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    safety_assured do
      execute <<-SQL.squish
        INSERT INTO status_stats (status_id, reactions_count, updated_at, created_at)
        SELECT status_id, count(status_id), greatest(updated_at) AS updated_at, least(created_at) AS created_at
        FROM status_reactions GROUP BY status_id, updated_at, created_at
        ON CONFLICT (status_id) DO UPDATE
        SET reactions_count = EXCLUDED.reactions_count, updated_at = greatest(status_stats.updated_at, EXCLUDED.updated_at)
      SQL
    end
  end
end
