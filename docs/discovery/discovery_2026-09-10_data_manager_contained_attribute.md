# Discovery 2026-09-10: creating a contained attribute in the Data Manager

## Objective

Retake `tutorial-03-chen-grown.png` with the restyled Chen notation. The picture shows the grown
`People` model, so the model has to be grown first, and the tutorial grows it through the Data
Manager. Automating those steps failed at the same point five times, which turned the task into a
discovery on how build 3154 creates an attribute inside an entity.

## What was run

All against the local frontend on `http://localhost:3000` in offline mode (build `3.0.0-beta (3154)`),
seeded from `scripts/video-pills/work/storage.json`, project `ERDLanguage`, model `People`.

- `scripts/video-pills/shots-tutorial-03.mjs`, five runs, each failing on the same control.
- `scripts/video-pills/probe-dm.mjs`: the buttons of the Data Manager after creating an entity.
- `scripts/video-pills/probe-dm2.mjs`: the instance form of an existing entity (`Role`) in Basic and
  in Advanced.
- `scripts/video-pills/probe-dm3.mjs`: the draft dialog of **New Attribute**, with and without an
  entity selected first.
- `scripts/video-pills/probe-vp2.mjs`, `probe-vp3.mjs`: whether a viewpoint can be removed (needed to
  re-record the tutorial 2 video, see below).

Screenshots of each state are in `scripts/video-pills/work/probe*.png`.

## Findings

**1. The `ownedAttributes` section with «Add Attribute» is not in build 3154.**
`tutorials/03-data-manager.md` Step 3 says: «Click **Add Attribute** in the `ownedAttributes` section
of `Department`. The dialog is `New Attribute · Attribute · Department`: the container is decided by
the button you clicked, not by a field you fill.»

What the build shows, with an entity selected in the Entity table:

- the instance form in **Basic** has `PROPERTIES` and `ATTRIBUTES` with the single `name` field, and
  nothing else;
- the instance form in **Advanced** adds two collapsible sections, `Attributes 1` and `References 1`,
  and one control, **add target**;
- **add target** does not open the creation draft. No `.instance-manager__draft` appears.

There is no control anywhere in the form whose label is «Add Attribute».

**2. «New Attribute» always creates at the model root.**
With the Attribute metaclass selected, the table header offers **New Attribute**. Its draft reads
`New Attribute · Attribute · model root · not created until «Create»` and has exactly three fields,
`type`, `isKey`, `name`. The header says `model root` **whether or not an entity is selected first**:
the two probes produced byte-identical dialogs. There is no container field and no container picker.

**Consequence**: in this build the Data Manager cannot put an attribute inside an entity. A reader
following tutorial 3 on the release build gets stuck at Step 3, which is the third step of the
tutorial. The published page describes an interface that is not there.

**3. A viewpoint cannot be deleted from the interface.**
Needed for re-recording the tutorial 2 video, which builds `ChenNotation` from scratch and therefore
needs a project without it. The project sidebar row is a bare `<span class="psb-item-name">` with no
actions on hover; the tree row in the metamodel editor exposes one `.tree-row__action` (the «+» that
adds a view) and no delete; right-click yields no context menu on either. Emptying
`DProject.viewpoints` through the L proxy is refused silently, and writing the raw array empties it
without removing the viewpoint from the sidebar, before or after reopening the project: the list is
not read from that array.

**4. Two smaller things.**
The «What's new» modal (`.wm-modal`) reappears on every fresh profile and swallows clicks;
`jjodel-dismissed-notifications` is `[]` in the seeded storage and hiding `.wm-backdrop` alone is not
enough. And `helpers.js` `H.dm.addAttribute` / `H.dm.newEntity` are stale against 3154 for the reason
in finding 1: they wait for «Add Attribute» forever.

## Risks

Finding 1 is on `alfonso-frontend-jjtl`, the release branch, eleven days before the 3.0 release, and
the affected page is already published on docs.jjodel.io. Tutorials 3, 4 and 5 all start from the
model that Step 3 grows, so the whole tutorial chain rests on it.

## Open questions for Alfonso

1. Is the missing containment creation a regression to fix before the 15th, or is the Data Manager
   meant to create only at the model root in 3.0? The answer decides whether tutorial 3 gets a fixed
   UI or a rewritten Step 3.
2. `tutorial-03-chen-grown.png` is held until then: the grown model cannot be built without that
   control, and rewriting the step would change what the picture should show anyway.
3. For the tutorial 2 video, with no way to delete a viewpoint, the options are: export the project,
   strip the viewpoint from the JSON, re-import it as a second project and record there; or leave the
   video as it is, with the note already in the page saying it was recorded with the Data (ER)
   presets and that the steps are unchanged.
