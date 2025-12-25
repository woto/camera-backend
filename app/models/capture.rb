class Capture < ApplicationRecord
  belongs_to :event
  belongs_to :offset_base_capture, class_name: "Capture", optional: true
  belongs_to :room, optional: true

  has_one_attached :video
  has_many_attached :thumbnails
  # hls_manifest_path stores public path like "/hls/capture-123/master.m3u8"

  after_commit :enqueue_hls_generation, on: [ :create, :update ]

  validates :video, attached: true

  before_validation :inherit_room_from_event

  private

  def inherit_room_from_event
    self.room_id ||= event&.room_id
  end

  def enqueue_hls_generation
    # Ensure we only enqueue when a video exists and we don't already have manifest
    return unless video.attached?
    return if hls_manifest_path.present? || hls_processing?

    GenerateHlsJob.perform_later(self.id)
  rescue => e
    Rails.logger.warn("[Capture#enqueue_hls_generation] failed to enqueue HLS job: #{e.message}")
  end
end
