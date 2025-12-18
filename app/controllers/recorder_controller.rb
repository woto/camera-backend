class RecorderController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :upload, :trigger ]

  def upload
    if params[:video].present?
      # Create uploads directory if it doesn't exist
      upload_dir = Rails.root.join("storage", "uploads", "recordings")
      FileUtils.mkdir_p(upload_dir)

      # Use original filename from upload (includes segment info)
      # Sanitize filename to prevent directory traversal
      original_filename = params[:video].original_filename
      safe_filename = File.basename(original_filename)
      filepath = upload_dir.join(safe_filename)

      # Save the uploaded file
      File.binwrite(filepath, params[:video].read)

      render json: { success: true, filename: safe_filename, message: "Video uploaded successfully" }, status: :ok
    else
      render json: { success: false, message: "No video file provided" }, status: :bad_request
    end
  rescue => e
    render json: { success: false, message: e.message }, status: :internal_server_error
  end

  def trigger
    # Broadcast signal to all connected clients via ActionCable
    ActionCable.server.broadcast("recording_channel", { action: "capture" })
    render json: { success: true, message: "Capture signal sent" }, status: :ok
  rescue => e
    render json: { success: false, message: e.message }, status: :internal_server_error
  end
end
