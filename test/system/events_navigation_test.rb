require "application_system_test_case"

class EventsNavigationTest < ApplicationSystemTestCase
  setup do
    @event = events(:visible_living)
  end

  test "All events link goes to events with selected highlighted" do
    visit event_path(@event)

    # Click the 'All events' link which includes selected param
    find("a[href='#{events_path(selected: @event.id)}']").click

    # Ensure the URL contains the selected param
    assert_current_path events_path(selected: @event.id)

    # The index should contain the selected element marker
    assert_selector "#event-#{@event.id}[data-selected='true']"
  end

  test "Browser back navigates to events with selected highlighted" do
    visit event_path(@event)

    # Simulate browser back; our controller sets up a history entry that points to events?selected=<id>
    page.evaluate_script("history.back()")

    # Wait for navigation to complete and check path
    assert_current_path events_path(selected: @event.id)
    assert_selector "#event-#{@event.id}[data-selected='true']"
  end

  test "pagination links are respected when selected param present" do
    # Start on page 3, open an event, go back, then navigate to page 4 explicitly
    visit events_path(page: 3)
    visit event_path(@event)

    # Simulate back navigation -> we should land on events with selected in query (page may be set by server or handled by client)
    page.evaluate_script("history.back()")
    assert_current_path /\/events.*selected=#{@event.id}/

    # Request page 4 explicitly with `selected` present; server should respect the explicit page
    visit events_path(page: 4, selected: @event.id)
    assert_current_path /\/events.*page=4/
  end

  test "clicking an event does not change visible URL to events?selected and reload doesn't redirect" do
    # Start from a paginated list so history contains a list entry
    visit events_path(page: 3)

    # Visit the event (this simulates clicking into it)
    visit event_path(@event)

    # The visible URL should be the event path (not events?selected=...)
    assert_current_path event_path(@event)
    assert_no_match(/selected=#{@event.id}/, current_url)

    # Reload the page (simulate browser refresh) - we should remain on the event page
    visit current_url
    assert_current_path event_path(@event)
  end

  test "pagination links do not include selected param" do
    # Create many events to ensure multiple pages
    100.times do |i|
      Event.create!(captured_at: Time.current - i.minutes)
    end

    selected = Event.first
    visit events_path(page: 8, selected: selected.id)

    # Pagination UI should not contain the `selected` query parameter in links
    within ".pagination" do
      all("a").each do |a|
        assert_no_match(/selected=/, a[:href].to_s)
      end
    end
  end

  test "selected event is styled prominently" do
    ev = events(:visible_living)
    visit events_path(selected: ev.id)

    assert_selector ".card.is-selected", count: 1
    el = find("#event-#{ev.id}")
    assert_equal "true", el["data-selected"]
    assert el[:class].include?("is-selected"), "Expected selected card to have 'is-selected' class"
  end

  test "player arrows: left shows newer, right shows older" do
    # Create three events far in the future so they are the most recent events in the DB
    newest = Event.create!(captured_at: Time.utc(3000, 1, 3))
    middle = Event.create!(captured_at: Time.utc(3000, 1, 2))
    oldest = Event.create!(captured_at: Time.utc(3000, 1, 1))

    # Add a capture to ensure the player controls (and arrow links) are rendered
    capture = Capture.new(event: middle)
    capture.save!(validate: false)

    # Visit the middle event and assert the visible left/right links point correctly
    visit event_path(middle)

    expected_newer = Event.where("captured_at > ?", middle.captured_at).order(captured_at: :asc).first
    expected_older = Event.where("captured_at < ?", middle.captured_at).order(captured_at: :desc).first

    left = find("[data-video-switcher-target='prevEventLink']")
    right = find("[data-video-switcher-target='nextEventLink']")

    left_id = left[:href].to_s.split("/").last.to_i
    right_id = right[:href].to_s.split("/").last.to_i

    assert_operator Event.find(left_id).captured_at, :>, middle.captured_at
    assert_operator Event.find(right_id).captured_at, :<, middle.captured_at
  end
end
