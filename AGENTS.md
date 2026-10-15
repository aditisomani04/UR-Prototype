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

- Keep driver-app translations in a shared client-safe locale dictionary; preserve names, addresses, equipment identifiers, phone numbers, and driver-authored comments verbatim so operational details remain accurate.
- Restore the preferred language from local storage after hydration and synchronize the document language for assistive technology; never read browser storage during SSR.
- Google Maps trip links preserve displayed remaining-stop order and use the final customer as destination, with branch return as a separate leg; this keeps four-stop demo trips within mobile web's three-waypoint limit and avoids routing back to branch after progress.
