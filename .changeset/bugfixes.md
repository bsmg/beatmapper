---
"beatmapper": patch
---

## Bugfixes

- The difficulty selector is now visible in the Lightshow view for better consistency across all editor views.
  - This capability was originally unsupported due to reconcilation issues when sharing lightshow data across beatmaps, but now that these issues are (from what I can tell) reliably fixed, it makes sense to allow this capability moving forward.
- The "decrement zoom level" action now sends the correct format for payloads, and should now work as intended.
- The "event update rate" field now sends the correct format for payloads, and should now work as intended.
- Releasing the event selection box outside of the event grid trigger will now commit selection.
- The "mirror selection" action for objects now applies the correct grid dimensions between notes and obstacles.
- Hovering the cursor over multiple objects will now properly block event propagation at the first targeted object.
- Firing object modification actions via scroll wheel will no longer duplicate history events due to faulty propagation.
