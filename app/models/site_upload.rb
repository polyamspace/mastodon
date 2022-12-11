# frozen_string_literal: true
# == Schema Information
#
# Table name: site_uploads
#
#  id                :bigint(8)        not null, primary key
#  var               :string           default(""), not null
#  file_file_name    :string
#  file_content_type :string
#  file_file_size    :integer
#  file_updated_at   :datetime
#  meta              :json
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  blurhash          :string
#

class SiteUpload < ApplicationRecord
  include Attachmentable

  STYLES = {
    thumbnail: {
      '@1x': {
        format: 'png',
        geometry: '1200x630#',
        file_geometry_parser: FastGeometryParser,
        blurhash: {
          x_comp: 4,
          y_comp: 4,
        }.freeze,
      },

      '@2x': {
        format: 'png',
        geometry: '2400x1260#',
        file_geometry_parser: FastGeometryParser,
      }.freeze,
    }.freeze,

    mascot: {}.freeze,
    favicon: {},
  }.freeze

  # Feels a bit hacky, but adds required sizes to favicon and then freezes it.
  %w(16 32 48 57 60 72 76 114 120 144 152 167 180 1024).each do |size|
    STYLES[:favicon][:"#{size}"] = {
      format: 'png',
      geometry: "#{size}x#{size}#",
      file_geometry_parser: FastGeometryParser,
    }.freeze
  end

  STYLES[:favicon].freeze

  has_attached_file :file, source_file_options: { all: '-background transparent' }, styles: ->(file) { STYLES[file.instance.var.to_sym] }, convert_options: { all: '-coalesce +profile "!icc,*" +set modify-date +set create-date' }, processors: [:lazy_thumbnail, :blurhash_transcoder, :type_corrector]

  validates_attachment_content_type :file, content_type: /\Aimage\/.*\z/
  validates :file, presence: true
  validates :var, presence: true, uniqueness: true

  before_save :set_meta
  after_commit :clear_cache

  def cache_key
    "site_uploads/#{var}"
  end

  private

  def set_meta
    tempfile = file.queued_for_write[:original]

    return if tempfile.nil?

    width, height = FastImage.size(tempfile.path)
    self.meta = { width: width, height: height }
  end

  def clear_cache
    Rails.cache.delete(cache_key)
  end
end
