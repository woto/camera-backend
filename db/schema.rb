# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_12_23_050935) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.text "name"
    t.text "record_type"
    t.bigint "record_id"
    t.bigint "blob_id"
    t.timestamptz "created_at"
    t.index ["blob_id"], name: "idx_16397_index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "idx_16397_index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.text "key"
    t.text "filename"
    t.text "content_type"
    t.text "metadata"
    t.text "service_name"
    t.bigint "byte_size"
    t.text "checksum"
    t.timestamptz "created_at"
    t.index ["key"], name: "idx_16390_index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id"
    t.text "variation_digest"
    t.index ["blob_id", "variation_digest"], name: "idx_16404_index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "captures", force: :cascade do |t|
    t.bigint "event_id"
    t.timestamptz "created_at"
    t.timestamptz "updated_at"
    t.decimal "offset_seconds", precision: 10, scale: 5
    t.bigint "offset_base_capture_id"
    t.bigint "room_id"
    t.text "hls_manifest_path"
    t.timestamptz "hls_processed_at"
    t.boolean "hls_processing", default: false
    t.text "hls_error"
    t.index ["event_id"], name: "idx_16434_index_captures_on_event_id"
    t.index ["hls_manifest_path"], name: "idx_16434_index_captures_on_hls_manifest_path"
    t.index ["offset_base_capture_id"], name: "idx_16434_index_captures_on_offset_base_capture_id"
    t.index ["room_id"], name: "idx_16434_index_captures_on_room_id"
  end

  create_table "events", force: :cascade do |t|
    t.timestamptz "captured_at"
    t.timestamptz "created_at"
    t.timestamptz "updated_at"
    t.bigint "base_capture_id"
    t.boolean "hidden", default: false
    t.bigint "room_id"
    t.index ["base_capture_id"], name: "idx_16428_index_events_on_base_capture_id"
    t.index ["captured_at", "room_id"], name: "idx_16428_index_events_on_captured_at_and_room_id", unique: true
    t.index ["room_id"], name: "idx_16428_index_events_on_room_id"
  end

  create_table "rooms", force: :cascade do |t|
    t.text "name"
    t.timestamptz "created_at"
    t.timestamptz "updated_at"
    t.index ["name"], name: "idx_16421_index_rooms_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.text "username"
    t.text "password_digest"
    t.timestamptz "created_at"
    t.timestamptz "updated_at"
    t.index ["username"], name: "idx_16442_index_users_on_username", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id", name: "active_storage_attachments_blob_id_fkey"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id", name: "active_storage_variant_records_blob_id_fkey"
  add_foreign_key "captures", "captures", column: "offset_base_capture_id", name: "captures_offset_base_capture_id_fkey"
  add_foreign_key "captures", "events", name: "captures_event_id_fkey"
  add_foreign_key "captures", "rooms", name: "captures_room_id_fkey"
  add_foreign_key "events", "captures", column: "base_capture_id", name: "events_base_capture_id_fkey"
  add_foreign_key "events", "rooms", name: "events_room_id_fkey"
end
