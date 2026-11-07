# IT Lab Simulators

Self-contained, single-file HTML training simulators.

| Simulator | Folder | Published page |
|---|---|---|
| IT Lab Simulator: datacenter, VMware/Hyper-V virtualization, network, AD/Entra, security & backup, 6 build scenarios | `itlab/` | https://claude.ai/artifact/31CfmsncKfZqiZkyk54GDh |
| RMM Lab Simulator: NinjaOne-style RMM workflows (orgs, policies, patching, automation, ticketing, backup), 6 practice scenarios, AI Lab Assistant | `rmmlab/` | https://claude.ai/artifact/4ncysNBJeZYVWff4eCdNvz |

The RMM simulator is an independent training tool and is not affiliated with NinjaOne.

## Working on a simulator
1. Edit `itlab/index.html` or `rmmlab/index.html`. Each is one file with no build step; open it in a browser to try it.
2. Run the tests: `cd tests && npm install && npm test` (headless jsdom; plays through the scenarios).
3. Commit, then republish the page to its artifact.

## AI Lab Assistant (RMM Lab)
The floating **✦ Ask AI** panel uses the artifact runtime's `sample` capability (`claude.use("sample")`), declared on the published artifact as `{"sample": {}}`. It is read-only except `open_page` (navigation). Its tools live in `AI_TOOLS`, and its instructions and UI map live in `AI_SYS`. Update the UI map when pages or buttons change. Outside claude.ai (plain file, tests) it shows an "unavailable" message instead.

## Conventions
- Hover-tip content lives in the `G` glossary object at the top of each file's script. Every `data-tip` / `tip()` key must exist there; the tests check this.
- Scenarios are in the `SCN` array: `[objective, checkFn, hint]`.
- Lab state is saved to the browser's localStorage only (`itlab-v1`, `rmmlab-v1`). Bump the key if the state shape changes in a breaking way.
