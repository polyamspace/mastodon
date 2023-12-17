# frozen_string_literal: true

class PolyamMoveIsExclusiveLists < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    List.update_all('exclusive=is_exclusive')
  end

  def down
    List.update_all('is_exclusive=exclusive')
  end
end
