# Reviewing GA4 in the browser console

Open Developer Tools → Console, enable **Preserve log**, and filter by **`[GA4]`**.
Logs are always enabled, including in production builds. No query parameter or
GA4 account access is needed.

| Prefix | Meaning |
| --- | --- |
| `[GA4] command` | An app action handed to the Google tag queue. `event` entries show the final event name and normalized parameters, including page context. `set`, `js`, and `config` show page context and tag setup. |
| `[GA4] request` | An outgoing browser request to this site's GA4 measurement ID. Shows the event name, decoded parameters, transport, and every raw request parameter. Includes Google's automatic events such as `page_view`, `click`, `scroll`, and form interactions when enabled in GA4. |
| `[GA4] preview (sending disabled)` | The app action and parameters on localhost, development, or a preview hostname. These environments still do not load the production tag or send analytics. |

For warehouse photo arrows, look for `listing_gallery_interaction`,
`placement: warehouse_card`, and `action: next` or `previous`. The parameters
include `warehouse_id` and the destination `image_index`. Swipes use the same event.

An app event can have both a command entry and a later request entry. These are
two stages of the same event, not two events sent to GA4. Filter by `[GA4] request`
to review only outgoing events. Google may batch or delay requests; each event
in a batch gets its own log entry. A request log shows an attempted send, not
confirmation that GA4 received or processed it. An ad blocker can leave command
logs without request logs.

Automatic events are observed from Google's `/g/collect` or `/collect` requests
using fetch, sendBeacon, XMLHttpRequest, and the image fallback. Request/Blob
bodies are read asynchronously; Request bodies are cloned. Application API
requests and form payloads are not logged. The request observer depends on
Google's browser transport format; it does not expose events or parameters
generated later inside GA4. On local/preview hosts, automatic-event request logs
are absent because the Google tag is intentionally disabled.

Implementation: [analytics.ts](../src/lib/analytics.ts) and
[analyticsConsole.ts](../src/lib/analyticsConsole.ts). The logger uses
`window.console.log` so the production build retains these logs while continuing
to strip ordinary console calls elsewhere.

Validation: all 10 `npm run test:analytics` checks, TypeScript app checking,
focused ESLint, and a production SPA build passed. Two Chromium checks loaded
that bundle with the real Google tag and intercepted collection requests. They
verified matching console/request payloads for gallery arrows, successful leads,
automatic page views, form starts, scrolls, and outbound clicks; four navigations
produced exactly four page views. The preview-host check verified console output
without loading the tag or sending analytics. Backend submissions used fixtures.
