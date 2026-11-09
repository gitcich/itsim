# itsim: Hands-on IT Training Simulators

**itsim** is a set of browser-based simulators for practicing real IT and managed-services work without touching real systems. You build an environment, run it, break it, and fix it while the simulator explains every concept as you go.

Each simulator is a single self-contained web page with no installs, servers, or accounts to set up. They work on desktop and on a phone, and your lab is saved in your own browser.

**Try them now:** **https://gitcich.github.io/itsim/** (no account needed)

| Simulator | What you practice | Open it |
|---|---|---|
| **IT Lab Simulator** | Building and running a company's infrastructure: physical servers, VMware and Hyper-V virtualization, networking, Active Directory / Entra ID, security controls and backup | [Launch](https://gitcich.github.io/itsim/itlab/) |
| **RMM Lab Simulator** | Managing many clients the way an MSP does, with NinjaOne-style remote monitoring & management: policies, alerting, patching, automation, ticketing, backup and remote support, plus an AI tutor | [Launch](https://gitcich.github.io/itsim/rmmlab/) · [with AI assistant](https://claude.ai/artifact/4ncysNBJeZYVWff4eCdNvz) |

**Who it's for:** help-desk and sysadmin learners, people moving into IT or MSP roles, interview prep, and anyone who sells to, supports or partners with IT teams and wants to understand the work hands-on.

> The RMM Lab Simulator is an independent training tool modeled on NinjaOne-style workflows. It is not affiliated with or endorsed by NinjaOne. No real devices, accounts or networks are managed by either simulator.

---

## Features shared by both simulators

- **Hover help on everything:** every **?** icon (and many buttons) opens a tip with a plain-English **definition**, **how to do it**, and **alternative technologies**, e.g. Proxmox and Nutanix next to VMware, or Datto RMM and N-able next to NinjaOne. On phones, tap instead of hover.
- **Guided scenarios:** six real-world projects per simulator, each with an objective checklist that ticks off live as you build, a hint for every step, and progress shown on every page.
- **Realistic rules:** actions have prerequisites and consequences, so mistakes teach you something. For example, you can't build Active Directory without a running domain controller, and you can't live-migrate without shared storage.
- **Event / activity log:** a running console of everything that happened and why.
- **Sample environments:** load a ready-made company or MSP with one click, or start from scratch.
- **Saved progress:** your lab is kept in your browser between visits. You can reset any time.
- **Mobile-friendly:** responsive layout, tap-to-open tips, collapsible log.

---

## IT Lab Simulator

Build and operate a company's IT environment in either a **VMware vSphere-style** or **Microsoft Hyper-V / System Center-style** console. The switch changes the terminology throughout (vMotion ↔ Live Migration, Snapshot ↔ Checkpoint, vCenter ↔ SCVMM), and both hypervisors can run side by side in one lab.

### Datacenter (physical layer)
- Add rack servers (Dell, HPE, Lenovo, Cisco) with CPU cores and RAM, running ESXi or Hyper-V
- Create clusters with **High Availability** and **load balancing (DRS / Dynamic Optimization)**
- Storage: **SAN (iSCSI)**, **NAS (NFS/SMB)**, **vSAN**, **Storage Spaces Direct**, or local disk, each presented to chosen hosts with its own rules
- Capacity bars with CPU overcommit (4:1) and hard RAM limits
- **Maintenance mode** with automatic VM evacuation, host **patching**, and a **host failure test** that proves whether your HA design really works

### Virtualization
- Create VMs with a server role (Domain Controller, RODC, DHCP, File, SQL, Web, Backup, Log Collector, RDS), guest OS, vCPU, RAM, disk, host, storage and VLAN
- Power on/off, **snapshots/checkpoints** (revert, consolidate) with warnings for risky actions like reverting a DC
- **Live migration** (needs shared storage and the same hypervisor) or **cold migration**, including cross-hypervisor V2V

### Networking
- VLANs and subnets per site, with checks for duplicate VLAN IDs and subnets
- Virtual switches (vSphere Standard/Distributed, Hyper-V External/Internal/Private, SET) with uplink redundancy warnings
- Ordered **firewall rules** with first-match logic and a **default-deny** rule, plus a warning if rules sit below it
- DHCP scopes, DNS records, and **site-to-site VPN** (IPsec, SD-WAN, Azure VPN Gateway, WireGuard)

### Identity
- Promote a forest/domain (DNS created automatically)
- OUs, users (single or bulk import), security groups, admin accounts
- **Group Policy**: security baseline, password & lockout, BitLocker, Windows LAPS, update rings, drive maps, firewall
- **Microsoft Entra Connect** hybrid identity sync

### Security & backup
- Controls: **MFA**, **EDR**, **patch management**, **SIEM/central logging**, **privileged access management**
- Backup jobs to local, **immutable**, or **offsite/cloud** repositories with RPO choices, plus **restore tests**
- **Security posture score** (12 checks) on the dashboard, showing gaps at a glance

### Network Diagram
- A live diagram generated from your lab: internet uplink, edge firewall, switches, VLANs/subnets, clusters, hosts, VMs, storage links and remote sites over VPN (unconnected sites are flagged)
- **Device IDs on everything** (`FW-001`, `SW-…`, `CL-…`, `HST-…`, `VM-…`, `STG-…`, `VPN-…`) and simulator-assigned IP addresses (gateway .1, hosts from .2 on the Management VLAN, VMs from .10, storage from .240 on a Storage VLAN)
- Status colors (online, maintenance, failed; VM on/off/down) and VLAN color coding
- Toggle VMs, IPs and storage links; zoom; click any device to jump to where it's managed
- **Device inventory** table, plus export as **SVG**, **PNG** or **CSV**, or copy to the clipboard

### Learning Library
- **50 networking guides** from [natted.cloud/learn](https://natted.cloud/learn) in seven categories (Fundamentals, Routing & Protocols, Security, Troubleshooting, Cloud & Modern Networking, Switching & Layer 2, Real-World Scenarios), each with a short summary and a link to the full guide
- Search and category filters
- **Library → simulator:** "Try it in the simulator" buttons jump to the matching card (VLANs, firewall, DHCP, DNS, VPN, clusters, storage, identity, security) and highlight it
- **Simulator → library:** 📚 buttons on section cards, a "Learn more" list in every pinned hover tip, and "Study first" guides on each scenario

### Dashboard
- Live topology of clusters, hosts and VMs, host load, and the posture checklist

### Build scenarios
1. **Small business foundation:** two hosts, shared storage, VLANs, a domain, DHCP and users
2. **High-availability cluster:** cluster, HA, live migration, and surviving a host failure
3. **Hybrid identity rollout:** two DCs, groups, password GPO, Entra sync, MFA
4. **Open a branch office:** branch VLAN, VPN, DHCP, firewall rule, RODC, branch GPO
5. **Backup & DR readiness:** 3-2-1-1 backups, immutable and offsite copies, tested restore
6. **Security hardening audit:** baselines, LAPS, EDR, SIEM, PAM, default deny, patched hosts, 85%+ posture

---

## RMM Lab Simulator

Practice the day-to-day of an MSP technician in a console modeled on **NinjaOne-style** workflows. A **simulated clock** (**+1 hour** / **+1 day**) drives everything: device health drifts, alert conditions are evaluated, and scheduled automations, patch windows and backups fire at their set hours, so you see the effect of every configuration choice.

### Organizations, locations & devices
- Organization → Location → Device hierarchy, with **policy mapping by device role** (Windows Workstation, Windows Server, macOS, Linux Server)
- **Agent installers** per location that deploy devices straight into the right org, site and policy
- Device pages with health (disk, CPU, services, reboot state, AV, backup), patches, software and alerts
- Device actions: **remote session**, run automation, reboot, **policy override**, remove/offboard
- **IT documentation** per client: credential vault (masked, with reveal logged), apps & services, network notes, knowledge base

### Agent policies
- **Policy inheritance:** child policies inherit from a parent and can override individual sections
- **Conditions:** disk, CPU, offline, stopped service, pending reboot, antivirus not running, backup failed, and a **compound condition**, each with a severity and these actions:
  - **Create ticket**
  - **Notify** a technician
  - **Run an automation to self-heal**: if the fix works, the alert resets on its own
- **Scheduled automations:** hourly or daily
- **OS patching:**
  - Scan and install hours (the maintenance window)
  - Approve / Manual / Reject rules per severity
  - Reboot behavior
  - Hold patches flagged by **Patch Intelligence AI**
- **Software:** standard installs and **third-party patching** (Chrome, Firefox, 7-Zip, Zoom, Adobe Reader, Microsoft 365, Teams)
- **Security:** antivirus/EDR deployment and monitoring
- **Backup:** Image or File & Folder, to Cloud, Local or Hybrid, on a daily schedule

### Operations
- **Automation Library:** built-in scripts plus your own (PowerShell, Batch, ShellScript, Python, VBScript)
- **Patching:** release a **Patch Tuesday**, scan or install on demand, per-KB status across the fleet, a manual review queue, and **patch compliance** by client
- **Alerts:** active and recently cleared, with an auto-remediated badge, ticket creation and reset
- **Ticketing:** board by status, with priority, assignee, notes, sources (alert, phone, email, portal) and **SLA timers** (P1 4h / P2 8h / P3 24h / P4 72h) with breach highlighting
- **Remote sessions:** background-mode Services (restart), Terminal, File transfer and Processes
- **Backup:** per-device status, back up now, and **restore tests**
- **Dashboard:** devices online, active alerts, open tickets, patch compliance, AV coverage, server backup health, per-client summary

### AI Lab Assistant
- A **✦ Ask AI** tutor available on every page, as a floating window or **docked as a resizable sidebar** that stays open while you work
- Explains RMM concepts and compares how NinjaOne, ConnectWise, Datto RMM, N-able, Kaseya, Atera and Intune handle them
- Tells you exactly where to click in the simulator
- **Looks at your actual lab** (devices, policies including inherited settings, alerts, tickets, recent activity) before answering, and shows which lookups it used
- **Scenario coaching:** knows which objectives are done; gives a hint first, the full walkthrough only if you ask
- Can open the right page or device for you; it never changes settings, so you do the work
- Shortcuts: **Get a hint** on a running scenario and **Ask AI** on any device
- Runs when the simulator is opened on claude.ai; elsewhere it shows a friendly "unavailable" note and everything else still works

### Practice scenarios
1. **Onboard a new client:** organization, locations, policy mapping, agent deployment, documentation
2. **Patch Tuesday:** approval rules, AI-flagged patch hold, 100% compliance without installing the unstable update
3. **Self-healing disk alerts:** a condition that runs a cleanup script, opens a ticket, and auto-resolves
4. **Service desk triage:** assign the queue, fix a stopped Print Spooler remotely, add notes, resolve the P1 within SLA
5. **Standardize software & protection:** standard apps, Chrome patching, antivirus, AV-not-running alerting
6. **Server backup & recovery:** image backups to hybrid storage, failure alerting, a successful restore test

---

## Repository layout

```
index.html            Landing page served by GitHub Pages
itlab/index.html      IT Lab Simulator (single file: HTML, CSS, JS)
rmmlab/index.html     RMM Lab Simulator (single file)
tests/                Headless tests (jsdom) that play through every scenario
```

## Working on a simulator
1. Edit `itlab/index.html` or `rmmlab/index.html`. There is no build step; open the file in a browser to try it.
2. Run the tests: `cd tests && npm install && npm test`. They play through all 12 scenarios, check every hover-tip key, and exercise the AI assistant with a stubbed model.
3. Commit on a branch and open a pull request. Merging to `main` updates the GitHub Pages site automatically; republish the claude.ai artifact separately.

## AI Lab Assistant (developer notes)
The assistant uses the claude.ai artifact runtime's `sample` capability (`claude.use("sample")`), declared on the published artifact as `{"sample": {}}`. Its read-only lab tools are in `AI_TOOLS`, plus `open_page` for navigation. Its instructions and the simulator UI map are in `AI_SYS`; update the map when pages or buttons change. Panel layout (floating or sidebar, open state, width) is saved in localStorage under `rmmlab-ai-ui`.

## Conventions
- Hover-tip content lives in the `G` glossary object in each file. Every `data-tip` / `tip()` key must exist there; the tests check this.
- Library guides live in the `LIB` array in `itlab/index.html` (`[id, title, category, summary, glossary keys, url slug]`); `LIB_ANCHOR` maps glossary keys to the simulator card (`data-anchor`) where they're practiced.
- Scenarios live in the `SCN` array as `[objective, checkFn, hint]`.
- Lab state is saved in localStorage only (`itlab-v1`, `rmmlab-v1`). Bump the key if the state shape changes in a breaking way.

## Hosting
- **GitHub Pages:** served from the `main` branch root (`index.html` landing page, `.nojekyll` so files are served as-is). Everything works there except the AI assistant.
- **claude.ai artifacts:** the RMM Lab artifact has the `sample` capability that powers the AI assistant; the IT Lab artifact has `downloads` for diagram exports. On GitHub Pages, exports use a normal browser download.

## Analytics
Page views on the GitHub Pages site are counted with [GoatCounter](https://www.goatcounter.com/), a privacy-friendly service with no cookies (dashboard: https://itlab.goatcounter.com). The landing page uses the standard snippet. The simulators load the same script only when served from `*.github.io`, so the claude.ai artifact copies, which block outside scripts, don't try.

## License
MIT, see [LICENSE](LICENSE). You're free to use, adapt and share these simulators; please keep the copyright notice.

## Versions
| Tag | Change |
|---|---|
| `itlab-v1` | IT Lab Simulator first release |
| `rmmlab-v1` | RMM Lab Simulator first release |
| `rmmlab-v2` | AI Lab Assistant |
| `rmmlab-v3` | Assistant can dock as a resizable sidebar |
| `site-v1` | MIT license, GitHub Pages landing page |
| `itlab-v2` | Learning Library linked to natted.cloud/learn guides |
| `itlab-v3` | Network diagram with device IDs, inventory and SVG/PNG/CSV export |
