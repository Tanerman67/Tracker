# Unified Settings

The Settings screen owns all profile, activity, nutrition and date editors. Nutrition and the Energy Balance card link to the corresponding group. Existing IDs are retained for date widgets and accessible labels. No schema migration is required.

`settings.js` renders the existing energy profile controls and moves calculation options into the common disclosure. Main nutrition targets are edited only here. Protein's canonical value remains `data.proteinGoal`; edits synchronize its tracker, rule target and a pre-existing nutrition protein alias. Hidden fibre and unknown nutrition goals are retained. Unchanged blank values preserve absent/null distinctions; clearing an edited target uses its established null/deletion convention. Personal dates never rewrite legacy alcoholDate.

Saving builds a clone, validates every group and rule, then submits one `persistData` call to existing three-way merge, lock, durable copies and vault mechanisms. On conflict/write failure the existing durable-state recovery applies and the form draft remains. No success message appears on failure. Navigation and unload protect dirty input. Appearance changes remain independent. Controls are disabled during commit.

Advanced Settings contains existing backup, diagnostics, recovery, conflict and reset tools; existing confirmation and warning mechanisms remain. The settings save failure opens Advanced automatically.

Testing: Node regression suite plus Playwright settings.spec.cjs and updated existing editor/backup scenarios. Browser results are recorded in the branch workflow. No deployment is requested by this change.
