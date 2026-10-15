<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep driver-app UI translations in a shared client-safe locale dictionary (site-note translations travel with the private schedule); preserve names, addresses, equipment identifiers, phone numbers, and driver-authored comments verbatim so operational details remain accurate.
- Restore the preferred language from local storage after hydration and synchronize the document language for assistive technology; never read browser storage during SSR.
- Google Maps trip links preserve displayed remaining-stop order and use the final customer as destination, with branch return as a separate leg; this keeps four-stop demo trips within mobile web's three-waypoint limit and avoids routing back to branch after progress.
- MCP server lives in src/lib/mcp (one tool per file, registered in index.ts) and is public/read-only over the built-in sample schedule; all customer details in it are fictional.
- The schedule is built-in sample data in src/lib/schedule-data.ts, imported directly by client code; sign-in uses the sample driver list in src/lib/trips.ts (no real accounts).
- Driver progress rows in stop_progress are keyed by the sample driver id (driver_id text) with open anon access — prototype only, never store real customer data; offline copies are kept per driver id on the device.
- Decorative animations (the trip-complete confetti and balloons overlay) live in src/components, take their colours from the semantic design tokens, and must keep a prefers-reduced-motion fallback that drops the motion while still showing the message.
