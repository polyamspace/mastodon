# frozen_string_literal: true

class PolyamChangeBypassInvitePermissionValue < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  class UserRole < ApplicationRecord; end

  def change
    admin_role     = UserRole.find_by(name: 'Admin')
    moderator_role = UserRole.find_by(name: 'Moderator')
    everyone_role  = UserRole.find_by(id: -99)

    legacy_permission = ::UserRole::FLAGS[:legacy_bypass_invite_limits]

    if everyone_role && legacy_permission && everyone_role.permissions == (everyone_role.permissions | legacy_permission)
      everyone_role.permissions &= ~legacy_permission
      everyone_role.permissions |= ::UserRole::FLAGS[:bypass_invite_limits]
      everyone_role.save
    end

    if moderator_role
      moderator_role.permissions &= ~legacy_permission if legacy_permission && moderator_role.permissions == (moderator_role.permissions | legacy_permission)
      moderator_role.permissions |= ::UserRole::FLAGS[:bypass_invite_limits]
      moderator_role.save
    end

    return unless admin_role

    admin_role.permissions &= ~legacy_permission if legacy_permission && admin_role.permissions == (admin_role.permissions | legacy_permission)
    admin_role.permissions |= ::UserRole::FLAGS[:bypass_invite_limits]
    admin_role.save
  end
end
