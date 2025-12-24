require "test_helper"

class EventVisibilityTest < ActionDispatch::IntegrationTest
  setup do
    @user1 = users(:user_one) # room: living_room
    @user2 = users(:user_two) # room: bedroom
    @living_room = rooms(:living_room)
    @bedroom = rooms(:bedroom)
    
    @visible_living = events(:visible_living)
    @hidden_living = events(:hidden_living)
    @visible_bedroom = events(:visible_bedroom)
    @hidden_bedroom = events(:hidden_bedroom)
  end

  test "guest sees all visible events even if room is selected" do
    get events_path
    assert_response :success
    assert_select ".card", 2 # visible_living, visible_bedroom

    get events_path(room: @living_room.name)
    assert_response :success
    # Should see BOTH visible events even when living_room is selected
    assert_select ".card", 2
    assert_match I18n.l(@visible_living.captured_at, format: :long), response.body
    assert_match I18n.l(@visible_bedroom.captured_at, format: :long), response.body
    assert_no_match I18n.l(@hidden_living.captured_at, format: :long), response.body
  end

  test "user sees hidden events in the room they selected plus all visible events" do
    post session_path, params: { username: @user1.username, password: "secret" }
    
    # After login, no room is selected automatically anymore
    get events_path
    # visible_living, visible_bedroom
    assert_select ".card", 2
    
    # Select living room
    post room_selection_path, params: { room: @living_room.name }

    get events_path
    # visible_living, visible_bedroom, AND hidden_living
    assert_select ".card", 3

    get events_path(room: @bedroom.name)
    # visible_living, visible_bedroom, but NO hidden_bedroom (because session has living_room)
    assert_select ".card", 2
    assert_no_match I18n.l(@hidden_bedroom.captured_at, format: :long), response.body
  end

  test "guest sees hidden events if room is in session plus all visible" do
    # Guest selects room via room selection (sets session[:room_id])
    post room_selection_path, params: { room: @living_room.name }
    
    # Now guest should see hidden events in living_room + all visible
    get events_path
    # visible_living, visible_bedroom, hidden_living
    assert_select ".card", 3
    
    get event_path(@hidden_living)
    assert_response :success
  end

  test "accessing hidden event directly" do
    # Guest without room selection
    get event_path(@hidden_living)
    assert_response :not_found
    
    # User1 access hidden in their room
    post session_path, params: { username: @user1.username, password: "secret" }
    post room_selection_path, params: { room: @living_room.name }
    get event_path(@hidden_living)
    assert_response :success
    
    # User1 access hidden in other room (without selecting it)
    get event_path(@hidden_bedroom)
    assert_response :not_found
  end
end
