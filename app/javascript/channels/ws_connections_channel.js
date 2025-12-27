import consumer from "./consumer"

consumer.subscriptions.create("WsConnectionsChannel", {
  received(data) {
    if (!data || typeof data.count === "undefined") return

    document.querySelectorAll("[data-ws-connections-count]").forEach((el) => {
      el.textContent = data.count
    })
  }
})
