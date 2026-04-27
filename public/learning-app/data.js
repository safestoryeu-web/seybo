/* CompTIA Security+ SY0-701 — Learning Content & Question Bank
   Sources: Professor Messer Course Notes (SY0-701), Andrew Ramdayal Last Minute Cram,
   CompTIA Certification Companion, official SY0-701 Exam Objectives.
*/

const DOMAINS = [
  { id: 1, code: "1.0", title: "General Security Concepts", weight: "12%", color: "#3b82f6" },
  { id: 2, code: "2.0", title: "Threats, Vulnerabilities & Mitigations", weight: "22%", color: "#ef4444" },
  { id: 3, code: "3.0", title: "Security Architecture", weight: "18%", color: "#8b5cf6" },
  { id: 4, code: "4.0", title: "Security Operations", weight: "28%", color: "#10b981" },
  { id: 5, code: "5.0", title: "Security Program Management & Oversight", weight: "20%", color: "#f59e0b" }
];

/* CHAPTERS — comprehensive notes per topic. Each chapter is short enough to read on a phone
   in 5–10 min. Markdown-style: ## headings, * bullets, **bold**, `code`. */
const CHAPTERS = [
  /* ============== DOMAIN 1 — General Security Concepts ============== */
  {
    id: "1.1",
    domain: 1,
    title: "Security Controls",
    estMinutes: 6,
    body: `## Why security controls matter
Security risks come in many forms — malware, phishing, insider abuse, environmental hazards. **Controls** are the safeguards that prevent events, minimize damage, and keep systems running.

## The 4 control categories (WHO/WHAT enforces it)
* **Technical** — implemented by systems. Firewalls, antivirus, encryption, OS access lists.
* **Managerial** — administrative direction. Risk assessments, security policies, SOPs.
* **Operational** — performed by people. Awareness training, guards, change-review meetings.
* **Physical** — limit physical access. Fences, locks, badges, mantraps, lighting, guard shacks.

## The 6 control types (WHAT the control DOES)
* **Preventive** — blocks the action. Firewall rule, door lock, "no entry" policy.
* **Deterrent** — discourages the action. Warning sign, visible camera, login banner.
* **Detective** — finds and logs the action. SIEM alert, motion sensor, audit log review.
* **Corrective** — fixes things after the fact. Restore from backup, patch a vuln, IR runbook.
* **Compensating** — substitutes when the primary control isn't possible. Generator after a power outage; isolate a legacy app you can't patch.
* **Directive** — tells subjects what to do. AUP, "authorized personnel only" sign, secure-coding standard.

## Tip na skúšku
Jeden **nástroj môže byť viacerých typov súčasne**. Kamera je zároveň **odstrašujúca** (viditeľná) aj **detekčná** (nahráva). Pri otázkach klasifikuj podľa toho, čo má kontrola **urobiť**.`
  },
  {
    id: "1.2a",
    domain: 1,
    title: "CIA Triad & Non-repudiation",
    estMinutes: 5,
    body: `## The CIA Triad — the foundation of infosec
* **Confidentiality** — only authorized parties see the data. Achieved via encryption, access control, steganography.
* **Integrity** — data hasn't been altered (or alteration is detectable). Achieved via hashing, digital signatures, certificates.
* **Availability** — the system/data is reachable when needed. Achieved via redundancy, fault tolerance, patching, capacity planning.

Sometimes called the **AIC triad** to avoid confusion with the U.S. Central Intelligence Agency.

## Non-repudiation
"You can't deny you did it." Two pieces work together:
* **Proof of integrity** — a hash shows the message wasn't changed.
* **Proof of origin** — a digital signature (signed with the **sender's private key**) proves *who* sent it.

A handwritten signature on a contract is a real-world non-repudiation control. Digitally, **digital signatures** provide the same property.

## Tip na skúšku
Ak otázka hovorí, že „správa sa nezmenila a vieme, kto ju poslal“, odpoveď je **digitálny podpis** (poskytuje integritu, autenticitu a nepopierateľnosť).`
  },
  {
    id: "1.2b",
    domain: 1,
    title: "AAA — Authentication, Authorization & Accounting",
    estMinutes: 5,
    body: `## The three A's
* **Authentication** — proving you are who you say you are.
* **Authorization** — what you're allowed to do once authenticated.
* **Accounting (Auditing)** — recording what you did.

## Authentication factors
* **Something you know** — password, PIN.
* **Something you have** — smart card, hardware token, phone (push notification, TOTP).
* **Something you are** — biometric: fingerprint, face, iris, retina, voice.
* **Somewhere you are** — geolocation / GPS / IP geofencing.
* **Something you do** — behavioral biometrics (typing rhythm, gait).

**Multifactor authentication (MFA)** combines factors from *different categories* — two passwords is NOT MFA.

## AAA for systems vs. people
* **Users** authenticate with passwords/MFA.
* **Devices** authenticate with **certificates** (PKI). The device presents its cert; the server validates against a trusted CA.

## Common AAA protocols
* **RADIUS** — UDP, encrypts only the password. Common for network access (Wi-Fi 802.1X, VPN).
* **TACACS+** — Cisco-favored, TCP, encrypts the whole payload. Granular command authorization.
* **Kerberos** — ticket-based SSO using a KDC. Time-sensitive (clock skew matters).
* **LDAP / LDAPS** — directory protocol; LDAPS is LDAP over TLS.`
  },
  {
    id: "1.2c",
    domain: 1,
    title: "Zero Trust",
    estMinutes: 6,
    body: `## The big idea
Old model: trust everything inside the perimeter, distrust everything outside. Zero Trust says **trust nothing, verify everything**, every time.

> "Never trust, always verify."

## Two planes
* **Control plane** — defines the policy. Who is allowed to do what, under what conditions.
* **Data plane** — enforces the policy. Where the actual user/data traffic flows.

## Control plane components
* **Adaptive identity** — risk-based: more checks if you sign in from a new country at 3am.
* **Threat scope reduction** — limit what each session can touch.
* **Policy-driven access control** — decisions based on identity, device posture, location, time.
* **Policy administrator / Policy engine** — make and push the decisions.

## Data plane components
* **Subject / system** — who is requesting access (user, service).
* **Policy enforcement point (PEP)** — the gate. Allows/blocks based on the engine's verdict.
* **Implicit trust zones** — minimized; once you're past the PEP you only get what was explicitly granted.

## In practice
Zero Trust often shows up as **microsegmentation**, **mTLS between services**, **continuous re-authentication**, and **SSE/SASE** suites that combine identity, device posture, and policy at the edge.`
  },
  {
    id: "1.2d",
    domain: 1,
    title: "Physical Security & Deception",
    estMinutes: 6,
    body: `## Physical access controls
* **Bollards** — short posts that stop vehicles from ramming a building.
* **Access control vestibule (mantrap)** — two interlocked doors; only one opens at a time. Stops tailgating.
* **Fencing** — perimeter; height + razor wire raise effort.
* **Video surveillance / CCTV** — detective; modern systems do motion + facial recognition.
* **Security guards** — flexible response; can verify identity and judge intent.
* **Access badge** — proximity card, smart card. Often paired with PIN (something-you-have + something-you-know).
* **Lighting** — deterrent + enables cameras.
* **Sensors** — infrared, pressure, microwave, ultrasonic — detect intrusion.

## Deception & disruption
The defender's psy-ops:
* **Honeypot** — a single fake system that looks juicy. Watches what attackers try.
* **Honeynet** — a whole fake *network* of decoys. Routers, servers, workstations.
* **Honeyfile** — a bait file (e.g., \`passwords.xlsx\`). If anyone opens it, an alarm fires.
* **Honeytoken** — fake credentials, API keys, or DB records sprinkled in real systems. Detected if used.

These are **detective** controls — they don't stop attackers but reveal them quickly and waste their time.

## Tip na skúšku
Hodnota honeypota je **informácie o hrozbách a včasné varovanie**, nie primárna obrana. Musí byť **izolovaný**, aby sa z kompromitácie nedalo preskočiť do produkcie.`
  },
  {
    id: "1.2e",
    domain: 1,
    title: "Gap Analysis",
    estMinutes: 3,
    body: `## What it is
A **gap analysis** compares your **current** security posture to a **desired** one (often defined by a framework like **NIST CSF**, **ISO 27001**, or a regulation like PCI DSS).

## Steps
1. **Define the target state** — pick the standard or business requirement.
2. **Inventory current controls** — what's actually in place?
3. **Compare** — find gaps (controls missing, partial, or weak).
4. **Plan remediation** — prioritize by risk and cost.
5. **Track** — close gaps and reassess on a schedule.

## Why it matters
You can't defend what you can't measure. Gap analysis turns a vague "we should improve security" into a **prioritized roadmap with owners and dates**. Often a starting point for **POA&Ms** (Plans of Action and Milestones).`
  },
  {
    id: "1.3",
    domain: 1,
    title: "Change Management",
    estMinutes: 6,
    body: `## Why change management is a security topic
Most outages and many breaches come from **bad changes**, not attackers. Formal change management catches risk before it ships.

## Process pieces
* **Change request** — proposes the change with business justification.
* **Approval process** — who signs off. Tiered by risk (standard / normal / emergency).
* **Owners** — responsible party for the change AND for the affected system.
* **Stakeholders** — anyone impacted (business, ops, security).
* **Impact analysis** — what could go wrong; what depends on this system.
* **Test results** — proof it works in a non-prod environment.
* **Backout plan** — how to revert quickly if it fails.
* **Maintenance window** — agreed downtime period.
* **SOP (Standard Operating Procedure)** — repeatable steps.

## Technical implications
* **Allow / deny lists** — change firewall rules, EDR allowlists carefully.
* **Restricted activities / downtime** — schedule for low-impact times.
* **Service restart** — required for many config changes.
* **Application restart** vs. **legacy applications** — some need full reboot or coordinated cutover.
* **Dependencies** — what other systems break if this one changes?

## Documentation
Always update **diagrams, runbooks, the version**, and the **CMDB**. The change isn't done when the deploy is done — it's done when the docs match reality.`
  },
  {
    id: "1.4a",
    domain: 1,
    title: "PKI & Encrypting Data",
    estMinutes: 7,
    body: `## Public Key Infrastructure (PKI)
A framework of policies, hardware, software, and procedures to **create, manage, distribute, store, and revoke** digital certificates.

* **Certificate Authority (CA)** — issues and signs certs. Trust is rooted in the CA.
* **Registration Authority (RA)** — verifies identity before the CA issues a cert.
* **Public/private key pair** — mathematically linked. Public is freely shared; private is *never* shared.

## Key types
* **Symmetric encryption** — same key encrypts and decrypts. **Fast**. Used for bulk data. Examples: **AES** (standard, 128/192/256 bit), 3DES (deprecated).
* **Asymmetric encryption** — public key encrypts, private key decrypts (or vice-versa for signing). **Slow**. Used for key exchange, signatures. Examples: **RSA**, **ECC** (smaller keys, same strength).

## Encryption levels
* **Full-disk encryption (FDE)** — BitLocker, FileVault. Protects laptops at rest.
* **Volume / partition** — encrypt a specific section of disk.
* **File / folder** — granular protection (EFS, GnuPG).
* **Database** — TDE (transparent data encryption) at the DB engine; or column-level for PII fields.
* **Record / field** — encrypt the specific value (e.g., credit card number).
* **Transport** — TLS in flight.

## Key management
* **Key length** — bigger = stronger but slower. AES-256, RSA 2048+, ECC 256+ are current minimums.
* **Key escrow** — a third party holds a copy of keys for recovery (controversial — required by some regs, banned by others).
* **HSM (Hardware Security Module)** — dedicated tamper-resistant hardware for key storage and crypto operations.
* **TPM (Trusted Platform Module)** — chip on the motherboard. Stores keys for FDE, attestation.
* **Secure enclave** — protected processor area on mobile devices (Apple, ARM TrustZone).
* **KMS (Key Management Service)** — cloud service (AWS KMS, Azure Key Vault) for managing keys at scale.`
  },
  {
    id: "1.4b",
    domain: 1,
    title: "Hashing & Digital Signatures",
    estMinutes: 5,
    body: `## Hashing — fingerprint of data
A **hash** is a one-way function that produces a fixed-length output ("digest") from any input.

* **One-way** — you cannot derive the input from the hash.
* **Deterministic** — same input → same hash, always.
* **Avalanche effect** — tiny input change → completely different hash.
* **Collision-resistant** — finding two inputs with the same hash should be infeasible.

## Hash algorithms
* **MD5** — 128-bit, **broken** (collisions known). Don't use for security.
* **SHA-1** — 160-bit, **deprecated**. Collisions demonstrated.
* **SHA-2** — current standard. Common variants: **SHA-256**, **SHA-512**.
* **SHA-3** — newer, different internal design (Keccak).

## Salting
A **salt** is random data added to a password before hashing. Defeats **rainbow tables** because the same password hashes differently per user. Modern password hashing uses **bcrypt**, **scrypt**, or **Argon2** which add salt + work factor automatically.

## Digital signatures
1. Sender **hashes** the message.
2. Sender **encrypts the hash with their private key** → that's the signature.
3. Receiver **decrypts the signature with the sender's public key** → gets the hash.
4. Receiver hashes the received message and compares.

If both hashes match: **integrity** (unchanged) + **authentication** (only sender's private key could create that signature) + **non-repudiation** (sender can't deny it).

## HMAC
**Hash-based MAC** — combines a hash with a shared secret. Provides integrity + authenticity but **not non-repudiation** (both parties have the secret).`
  },
  {
    id: "1.4c",
    domain: 1,
    title: "Certificates & Trust",
    estMinutes: 6,
    body: `## What's in a digital certificate (X.509)
* **Public key** of the subject.
* **Subject** — who the cert identifies (a CN like \`example.com\`).
* **Issuer** — the CA that signed it.
* **Validity dates** — not before / not after.
* **Serial number, signature, extensions** (e.g., **Subject Alternative Names — SAN**).
* The CA's **digital signature** binds it all together.

## Trust model
* **Root CA** — self-signed, top of the chain. Pre-installed in OS/browser trust stores.
* **Intermediate CA** — signed by root, signs end-entity certs. Limits damage if compromised.
* **End-entity / leaf** — the cert your website uses.

A browser validates the **chain of trust** all the way up to a root it trusts.

## Certificate types
* **Domain Validation (DV)** — proves you control the domain. Cheap/free (Let's Encrypt).
* **Organization Validation (OV)** — also verifies the org exists.
* **Extended Validation (EV)** — strict org verification; used to show green bar (mostly removed from browsers now).
* **Wildcard** — \`*.example.com\` covers all subdomains at one level.
* **SAN** — multiple specific names in one cert.
* **Self-signed** — you sign it yourself; browsers don't trust it without manual import. Fine for internal use.
* **Code-signing** — signs software so users can verify the publisher.

## Revocation
A cert may need to be killed before its expiry (key compromise, employee left, etc.):
* **CRL (Certificate Revocation List)** — large list of revoked serials, downloaded by clients. Doesn't scale well.
* **OCSP (Online Certificate Status Protocol)** — client asks the CA "is this cert revoked?" in real time.
* **OCSP stapling** — the server fetches the OCSP response and *staples* it to the TLS handshake. Faster, more private.

## Certificate Signing Request (CSR)
You generate a key pair, then submit a **CSR** (containing the public key + subject info) to the CA. The CA verifies you and signs it, returning the cert.`
  },
  {
    id: "1.4d",
    domain: 1,
    title: "Obfuscation, Steganography & Blockchain",
    estMinutes: 5,
    body: `## Obfuscation — hide in plain sight
Make data hard to understand without "encrypting" it in the cryptographic sense.
* **Steganography** — hide a message inside another file (image, audio, video). The carrier looks normal.
* **Tokenization** — replace sensitive values with non-sensitive tokens. The mapping lives in a vault. Heavily used for **PCI** (credit card data).
* **Data masking** — show partial data (\`****-****-****-1234\`) to users who don't need the full value.

Tokenization vs. encryption: encryption is **reversible with a key**; tokenization just looks up the original from a vault. A stolen token by itself is useless.

## Key Stretching
Slow down brute force by repeatedly hashing the password (PBKDF2, bcrypt, scrypt). Adds cost per attempt.

## Blockchain
A **distributed, append-only ledger** where each block contains:
* Transactions
* Timestamp
* **Hash of the previous block** (this is what makes it a *chain*)

Properties:
* **Decentralized** — many nodes hold the same ledger; no single party controls it.
* **Tamper-evident** — change one block and every later hash changes; majority of nodes would reject the rewrite.
* **Public** — open ledger (Bitcoin) or **private/permissioned** (enterprise blockchains).

Security uses: **integrity** of records, supply-chain provenance, identity, smart contracts. Not magic — hard to scale and not a substitute for traditional access control inside an org.`
  },

  /* ============== DOMAIN 2 — Threats, Vulnerabilities & Mitigations ============== */
  {
    id: "2.1",
    domain: 2,
    title: "Threat Actors & Motivations",
    estMinutes: 6,
    body: `## Actor categories
* **Nation-state / APT** — well funded, patient, highly skilled. Goals: espionage, infrastructure disruption, election interference. Threat is **external**.
* **Organized crime** — money. Ransomware, banking trojans, BEC. External, financially motivated.
* **Hacktivist** — ideology. Defacement, DDoS, doxing. External; can be very public.
* **Insider threat** — employees/contractors. Could be malicious (revenge, espionage) or accidental (clicking phish). **Internal**, often hardest to detect.
* **Script kiddie** — low skill, uses pre-built tools. Often opportunistic.
* **Shadow IT** — internal users/teams running unsanctioned tech (a personal Dropbox, a side AWS account). Not malicious but creates unmanaged risk.

## Attributes to compare
* **Internal vs external**
* **Resources / funding** — nation-state >> script kiddie.
* **Sophistication / capability**
* **Intent / motivation** — see below.

## Motivations
* **Data exfiltration**
* **Espionage**
* **Service disruption**
* **Financial gain**
* **Philosophical / political beliefs**
* **Ethical** (white-hat) — authorized testing
* **Revenge**
* **Disruption / chaos**
* **War**

## Why this matters
Knowing the actor shapes the **defenses you prioritize**. APTs need long-term threat hunting; opportunistic ransomware needs patching, MFA, and backups.`
  },
  {
    id: "2.2a",
    domain: 2,
    title: "Threat Vectors & Attack Surfaces",
    estMinutes: 6,
    body: `## Common message-based vectors
* **Email** — phishing, malware attachments, malicious links.
* **SMS (smishing)** — link to fake login.
* **Voice (vishing)** — phone call pretending to be IT/bank/IRS.
* **Instant messaging** — Slack/Teams/WhatsApp messages with malicious links.

## Image / file vectors
* Malicious links in embedded images, malicious **macros** in Office docs, malicious PDFs, **ISO/IMG files** to bypass mark-of-the-web.

## Removable media
USB drops in parking lots — old but still works. Malicious **HID** (rubber ducky) sticks pretend to be keyboards.

## Network vectors
* **Wireless** — rogue AP, evil twin, deauth attacks.
* **Wired** — unauthorized device on a port (defended with **802.1X**).
* **Bluetooth** — bluejacking/bluesnarfing.
* **Open service ports** — anything reachable is attackable.
* **Default credentials** — admin/admin on a router/IoT device.

## Supply chain
* **Vendors** — third-party software with vulnerabilities.
* **MSPs** — compromise the MSP, get into all customers (Kaseya 2021).
* **Hardware** — counterfeit components, implanted firmware.

## Human vectors / social engineering
* **Phishing** (email), **smishing** (SMS), **vishing** (voice), **whaling** (execs), **spear phishing** (targeted).
* **Pretexting** — invented scenario to extract info.
* **Misinformation / disinformation campaigns**.
* **Brand impersonation** — fake support pages, lookalike domains (**typosquatting**).
* **BEC (Business Email Compromise)** — pretend to be the CEO asking for a wire transfer.`
  },
  {
    id: "2.2b",
    domain: 2,
    title: "Phishing & Social Engineering Tactics",
    estMinutes: 6,
    body: `## Phishing variants
* **Phishing** — broad email net, generic lures.
* **Spear phishing** — targeted; uses real names, projects, vendor info.
* **Whaling** — targets a "big fish" (CEO, CFO).
* **Smishing** — SMS-based.
* **Vishing** — phone-based.
* **Watering hole** — compromise a site the target group routinely visits, infect them when they visit.
* **Pharming** — redirect users to a fake site at the DNS level.
* **Angler phishing** — fake customer-service accounts on social media that intercept complaints.

## What makes phishing work — the "principles of social engineering"
* **Authority** — "I'm from IT/HR/the CEO."
* **Intimidation** — "If you don't act, your account is locked."
* **Consensus / social proof** — "Everyone else has done this already."
* **Scarcity** — "Limited spots — act now."
* **Urgency** — "You have 5 minutes."
* **Familiarity / liking** — they spoof someone you know.
* **Trust** — they appear to be a known brand.

## Visible red flags
Misspelled domains (\`paypa1.com\`), generic greetings, unusual sender, mismatched display name vs. address, requests for credentials, attachments you didn't expect, urgent financial asks, links that don't match displayed text.

## Defenses
* User awareness training + simulated phishing.
* **DMARC, SPF, DKIM** for email authentication.
* **Email gateway** with sandboxing.
* MFA — phished password alone won't work.
* **FIDO2 / passkeys** — phishing-resistant by design.`
  },
  {
    id: "2.3a",
    domain: 2,
    title: "Application & OS Vulnerabilities",
    estMinutes: 8,
    body: `## Memory-based attacks
* **Buffer overflow** — write past the end of a buffer; can overwrite the return address and execute attacker code. Defenses: **NX/DEP** (no-execute memory), **ASLR** (randomize addresses), **stack canaries**, safe languages.
* **Memory injection** — inject code/data into a running process (DLL injection, process hollowing).
* **Race conditions** — two operations happen in the wrong order. Classic case: **TOCTOU** (Time-Of-Check / Time-Of-Use) — check a file's permissions, then use it; attacker swaps the file in between.

## Web application
* **SQL injection** — user input becomes part of a SQL query. Defense: **parameterized queries / prepared statements**, input validation, least-privilege DB accounts.
* **XSS (Cross-Site Scripting)** — attacker injects JavaScript that runs in another user's browser. Types: **reflected** (URL), **stored** (saved on server), **DOM-based**. Defense: output encoding, **CSP** (Content Security Policy), input validation.
* **CSRF (Cross-Site Request Forgery)** — tricks an authenticated user's browser into sending a request. Defense: **anti-CSRF tokens**, **SameSite** cookies.
* **Directory traversal** — \`../../etc/passwd\`. Defense: canonicalize paths, restrict to a base directory.
* **Insecure deserialization, SSRF, IDOR** — frequent in modern web apps.

## OS / system
* **Privilege escalation** — gain higher rights than granted.
* **Unpatched OS / kernel vulns** — exploited by malware once a user is on the box.
* **Default credentials, unnecessary services, open ports**.

## Mobile
* **Sideloading** — installing apps outside the official store. Bypasses platform vetting.
* **Jailbreaking / rooting** — removes OS sandbox; major risk.
* **Old OS versions** — Android updates lag. iOS is more uniform.

## Mitigation summary
**Patch**, **input validation**, **least privilege**, **secure defaults**, **secure coding training**, **SAST/DAST scanning**, **WAF**.`
  },
  {
    id: "2.3b",
    domain: 2,
    title: "Hardware, Cloud, Virtualization & Supply-Chain Vulns",
    estMinutes: 7,
    body: `## Hardware
* **Firmware** — runs before/under the OS. Compromised firmware survives reinstalls. **Secure Boot** + signed firmware help.
* **End-of-life (EoL)** — vendor stops issuing patches. Devices must be replaced or isolated.
* **Legacy systems** — still in use, not supported. Compensating controls (segmentation, allowlisting, monitoring).

## Virtualization
* **VM escape** — break out of a guest VM into the hypervisor or other guests. Rare but catastrophic.
* **Resource reuse** — one tenant's freed memory/disk leaks to another. Solved by zeroing on release; cloud platforms do this.
* **Hypervisor vulns** — patch them like any other software.

## Cloud-specific
* **Misconfiguration** — far and away the #1 cloud breach cause. Public S3 buckets, open security groups, weak IAM policies.
* **Inadequate IAM** — over-broad roles, shared keys, no MFA on privileged users.
* **Shared technology** — multi-tenant; isolation depends on the cloud provider.
* **Account hijacking** — phished cloud admin credentials = full takeover.
* **Insecure APIs** — exposed without auth or rate limiting.
* **Insufficient logging** — you can't investigate what you didn't log (turn on **CloudTrail**, **VPC flow logs**, etc.).

## Supply chain
* **Service providers** — your vendor's vulns become yours.
* **Hardware providers** — counterfeit chips/devices.
* **Software providers** — compromised dependencies (npm/PyPI), backdoored updates (**SolarWinds**).

Defense: **vendor risk management**, **SBOM** (Software Bill of Materials), code-signing verification, dependency pinning, **least functionality**.

## Zero-day vulnerabilities
A vuln **unknown to the vendor** with no patch available. The window between discovery and patch is the most dangerous. Defenses: defense-in-depth, behavior-based detection (EDR), network segmentation, virtual patching (WAF/IPS).`
  },
  {
    id: "2.4a",
    domain: 2,
    title: "Malware Types",
    estMinutes: 7,
    body: `## Self-replicating
* **Virus** — needs a host file and user action to spread. Types: boot sector, macro, polymorphic (changes its code), metamorphic.
* **Worm** — self-propagates over the network with no user interaction. Famous: Conficker, WannaCry.

## Hidden control
* **Trojan** — pretends to be legitimate software; user installs it.
* **RAT (Remote Access Trojan)** — gives the attacker persistent remote control.
* **Rootkit** — operates at the kernel/firmware level; very stealthy. Detection often requires booting from clean media.
* **Bootkit** — infects the boot loader so it loads before the OS.
* **Backdoor** — built-in or installed access mechanism that bypasses normal auth.

## Profit-driven
* **Ransomware** — encrypts files and demands payment. Modern variants do **double extortion** (also exfiltrate and threaten to leak).
* **Cryptominer / cryptojacker** — uses your CPU/GPU to mine cryptocurrency.
* **Spyware** — collects data without consent.
* **Keylogger** — records keystrokes (passwords, banking info).
* **Adware** — pop-ups, redirects, tracking.
* **Bloatware** — pre-installed unnecessary software (often vulnerable).

## Botnet & C2
* **Bot** — a single compromised device under attacker control.
* **Botnet** — a network of bots used for DDoS, spam, brute force.
* **C2 (Command and Control)** — the channel attackers use to communicate with their bots. Detecting **beaconing** (periodic check-in traffic) is a key threat-hunting technique.

## Logic bomb
Malicious code that triggers on a condition (date, file deletion, employee removed from payroll). Often planted by insiders.

## Fileless malware
Lives in memory only; uses legitimate tools like **PowerShell**, **WMI**, **mshta** ("living off the land"). Hard for signature-based AV to catch.`
  },
  {
    id: "2.4b",
    domain: 2,
    title: "Network Attacks",
    estMinutes: 7,
    body: `## Denial of Service
* **DoS** — single source overwhelms a target.
* **DDoS** — distributed; thousands of bots amplify the attack.
* **Volumetric / amplification** — DNS or NTP reflection: small request, huge response sent at the victim.
* **Application-layer DDoS (Layer 7)** — slow, low-volume requests that exhaust application resources (Slowloris).

Defenses: upstream scrubbing services (Cloudflare, AWS Shield), rate limiting, anycast, capacity headroom.

## DNS attacks
* **DNS poisoning / spoofing** — corrupt cache so users get wrong IP.
* **Domain hijacking** — attacker takes over the DNS account / registrar.
* **DNS tunneling** — exfiltrate data inside DNS queries.
* **URL hijacking / typosquatting** — register lookalike domains.

Defense: **DNSSEC** (signs DNS responses), restricted recursive resolvers, monitor for unusual DNS traffic.

## On-path (formerly Man-in-the-Middle)
Attacker positions between two parties and reads/modifies traffic.
* **ARP poisoning** — on local LAN, claim to be the gateway.
* **SSL stripping** — downgrade HTTPS to HTTP.
* **Browser-in-the-browser** — fake browser pop-up that mimics a real OAuth window.

Defense: **HSTS**, certificate pinning, mutual TLS, signed routing.

## Replay attack
Attacker captures a valid auth token / packet and **resends** it. Defense: **nonces**, **timestamps**, session IDs that expire.

## Wireless attacks
* **Evil twin** — rogue AP with the same SSID as a legitimate one.
* **Deauth attack** — force clients off Wi-Fi (then they reconnect to evil twin).
* **WPS PIN attack** — brute-forceable.
* **Bluejacking / bluesnarfing** — Bluetooth attacks.

## Cryptographic attacks
* **Birthday attack** — exploits hash collisions; the more inputs, the more likely two share a hash.
* **Downgrade attack** — force use of weak protocol (e.g., TLS 1.0). Defense: disable old protocols.
* **Collision** — two inputs produce same hash.
* **Key/IV reuse** — repeating a one-time value breaks the encryption.`
  },
  {
    id: "2.4c",
    domain: 2,
    title: "Password & Application Attacks",
    estMinutes: 6,
    body: `## Password attacks
* **Brute force** — try every combination. Defeated by **lockouts** + **long passwords** + **slow hashes**.
* **Dictionary attack** — try a list of common passwords/phrases.
* **Hybrid** — dictionary words + common substitutions (P@ssw0rd!).
* **Spraying** — try a few common passwords against MANY accounts (avoids per-account lockout).
* **Credential stuffing** — reuse breached username/password pairs from another site. Defense: unique passwords per site, MFA, breach detection.
* **Rainbow table** — precomputed hashes. Defeated by **salting**.
* **Pass-the-hash** — use the hash itself to authenticate without knowing the password (Windows NTLM).

## Application attacks
* **Buffer overflow** — covered earlier.
* **Race conditions / TOCTOU** — covered.
* **Injection** — SQL, LDAP, XML, command injection. Pattern: untrusted input becomes interpreter input.
* **Pointer/object dereference** — null-pointer crashes.
* **API attacks** — broken auth, excessive data exposure, lack of rate limiting (OWASP API Top 10).
* **Directory traversal** — \`../\` to escape intended folder.
* **Replay** — covered.
* **Session hijacking** — steal session cookies (XSS, network sniffing).
* **Privilege escalation** — vertical (user → admin) or horizontal (one user's data → another user's data).

## Defenses summary
* Parameterized queries
* Input validation **and** output encoding
* Least privilege everywhere
* MFA for users; cert/secret-vault auth for services
* Rate limiting + lockouts
* Strong session management (secure, HttpOnly, SameSite cookies)
* Patch promptly
* Test (SAST, DAST, pentest)`
  },
  {
    id: "2.4d",
    domain: 2,
    title: "Indicators of Compromise (IoCs)",
    estMinutes: 6,
    body: `## What's an IoC?
A clue that a system is or was compromised. Investigators use IoCs to find related infections and to share threat intel.

## Common IoCs
* **Account lockouts** — automated brute force.
* **Concurrent session usage** — same account logged in from two countries.
* **Blocked content** — repeated blocks from the same source = scanning/probing.
* **Impossible travel** — login from NYC, then 5 minutes later from Berlin.
* **Resource consumption** — CPU/disk/network spikes (cryptominer, exfil).
* **Resource inaccessibility** — files encrypted or quarantined.
* **Out-of-cycle logging** — logs at 3am from a service that runs 9–5.
* **Published IoCs** — hashes, IP addresses, domains shared by vendors/ISACs.
* **Missing logs** — attacker cleared them. The *absence* is the indicator.

## Where to look
* **SIEM** correlations
* **EDR** alerts (process trees, parent-child anomalies)
* **NetFlow / VPC flow logs** for unusual destinations
* **DNS logs** for known-bad domains and weird query patterns
* **Authentication logs** for spraying / impossible travel

## Threat intelligence
* **OSINT** — public sources.
* **Closed/Proprietary feeds** — paid feeds (Mandiant, Recorded Future).
* **ISACs** — industry sharing groups (FS-ISAC for finance, H-ISAC for healthcare).
* **STIX / TAXII** — standards for sharing structured threat intel.

## Pyramid of Pain
Hashes are easy for attackers to change; **TTPs** (Tactics, Techniques, Procedures) are hardest. Hunting for behavior beats chasing hashes.`
  },
  {
    id: "2.5",
    domain: 2,
    title: "Mitigation & Hardening Techniques",
    estMinutes: 6,
    body: `## Mitigation techniques
* **Segmentation** — divide the network into zones; a breach in one doesn't reach the others. Often via **VLANs** or **subnets** + firewall rules.
* **Microsegmentation** — segment down to individual workloads (host firewalls, service mesh).
* **Access control** — ACLs, permissions, least privilege.
* **Application allow lists** — only approved apps can run (positive security model). Strong but operationally heavy.
* **Application deny / block lists** — known-bad apps blocked.
* **Isolation / quarantine** — pull a compromised host off the network.
* **Patching** — close known vulns. Tier by severity and exposure.
* **Encryption** — both at rest and in transit.
* **Monitoring** — you can't respond to what you don't see.
* **Least privilege** — give every user/process the minimum it needs.
* **Configuration enforcement** — drift detection; reset machines to a known-good baseline.
* **Decommissioning** — formally retire and wipe old systems.

## Hardening targets (high-value places to harden)
* **Mobile devices** — MDM, encryption, screen lock, remote wipe.
* **Workstations** — EDR, FDE, principle of least privilege, USB control.
* **Servers** — minimal services, strict firewall, patched.
* **Switches/routers/network appliances** — change default creds, disable unused ports, restrict management plane.
* **Cloud infrastructure** — IAM least privilege, encryption, logging on, bucket policies tight.
* **SCADA/ICS** — segmentation; many can't be patched, so wrap them in perimeter defenses.
* **IoT** — separate VLAN, change defaults, disable cloud features you don't need.
* **Embedded systems / RTOS** — same as IoT, often EoL fast.
* **HVAC, BAS, cameras** — segment off the corporate network.`
  },

  /* ============== DOMAIN 3 — Security Architecture ============== */
  {
    id: "3.1a",
    domain: 3,
    title: "Cloud & Architecture Models",
    estMinutes: 8,
    body: `## Cloud service models
* **IaaS** — Infrastructure (VMs, storage, networking). You manage OS+up. Example: EC2.
* **PaaS** — Platform (managed runtime/DB). You manage code. Example: App Service, RDS.
* **SaaS** — Software. You manage configuration & data. Example: Microsoft 365, Salesforce.

## Cloud deployment models
* **Public** — multi-tenant, shared infrastructure (AWS, Azure, GCP).
* **Private** — dedicated to one organization (on-prem cloud or single-tenant hosted).
* **Community** — shared by orgs with similar concerns (gov agencies).
* **Hybrid** — mix of public + private with orchestration.
* **Multi-cloud** — using more than one public provider.

## Shared responsibility model
Provider always handles the **physical layer** + **hypervisor** (for IaaS).
* **IaaS** — customer handles OS, runtime, app, data, identity.
* **PaaS** — customer handles app + data + identity.
* **SaaS** — customer handles data + identity (and configuration).

If a question asks "who patches the host OS in IaaS?" — the customer.

## Other architecture concepts
* **On-premises** — full control, full responsibility, capital expense.
* **Centralized** — single big system; easier to manage, single point of failure.
* **Decentralized / distributed** — many smaller nodes; resilient, harder to manage.
* **Serverless** — functions execute on demand (Lambda). No servers to patch but tighter vendor lock-in and cold-start considerations.
* **Microservices** — many small services over a network. Need strong service-to-service auth (mTLS).
* **Containers** — lightweight, OS-level virtualization (Docker). Orchestrated by **Kubernetes**.
* **IoT / Embedded** — limited resources, often unpatchable.
* **ICS/SCADA** — operational tech; uptime > confidentiality.
* **RTOS** — real-time OS for time-critical embedded systems.
* **Edge computing** — process near where data is generated (factory, retail store).`
  },
  {
    id: "3.1b",
    domain: 3,
    title: "Network Infrastructure & Considerations",
    estMinutes: 7,
    body: `## Network concepts
* **Software-defined networking (SDN)** — separates the **control plane** (decisions) from the **data plane** (forwarding). Centralized policy, programmable.
* **VPC / VNet** — your private cloud network.
* **Public vs. private subnets** — whether instances have direct internet access.
* **NAT, gateway, transit gateway** — routing options between subnets.

## Infrastructure considerations
When choosing or designing infrastructure, weigh:
* **Availability** — uptime targets (e.g., 99.9% = ~8.7h downtime/yr).
* **Resilience** — survives failures (HA pairs, multi-region, auto-scaling).
* **Cost** — capex vs. opex; reserved vs. on-demand.
* **Responsiveness** — latency to users.
* **Scalability** — handles spikes (vertical = bigger box, horizontal = more boxes).
* **Ease of deployment** — IaC (Terraform, ARM, CloudFormation).
* **Risk transference** — outsource risk via SaaS or insurance.
* **Ease of recovery** — RTO/RPO; backup architecture.
* **Patch availability** — does the vendor still ship updates?
* **Inability to patch** — legacy/embedded — wrap in compensating controls.
* **Power** — dual feeds, **UPS** for short outages, **generator** for long.
* **Compute** — sized to workload + headroom.

## Security zones
Classic three-zone:
* **Internet (untrusted)**
* **DMZ (screened subnet)** — public-facing services live here.
* **Internal (trusted)** — Workstations, internal apps.
Plus: **management network** for admin access only, **OT network** for industrial gear.

## Attack surface = sum of exposed entry points
**Reduce surface** = fewer ports, fewer apps, fewer admins, no default creds. Most powerful single control.`
  },
  {
    id: "3.2a",
    domain: 3,
    title: "Secure Network Appliances",
    estMinutes: 6,
    body: `## Firewalls
* **Packet-filtering** — stateless. Looks at IP/port. Fast, blunt.
* **Stateful** — tracks connection state. Most LAN firewalls.
* **Next-Generation Firewall (NGFW)** — stateful + application awareness + IDS/IPS + decryption + identity. Layer 7.
* **Web Application Firewall (WAF)** — protects HTTP apps from OWASP-style attacks.
* **Unified Threat Management (UTM)** — multi-function appliance for SMBs (firewall, AV, IDS, content filter).

## Intrusion Detection / Prevention
* **IDS** — passive: detects, alerts. Out-of-band.
* **IPS** — inline: detects and **blocks**. In-line so it can drop packets.
Methods:
* **Signature-based** — known patterns. Misses unknowns.
* **Anomaly-based** — deviation from a learned baseline. Catches new attacks; more false positives.
* **Behavior-based** — flags actions inconsistent with normal user/system behavior.
* **Heuristic** — rule-of-thumb scoring.

## Other appliances
* **Load balancer** — distributes traffic across servers. Methods: round robin, least connections, IP hash. Provides HA + scale + SSL offload.
* **Proxy server** — sits between user and internet. **Forward proxy** for outbound, **reverse proxy** for inbound. Useful for filtering, caching, hiding internal IPs.
* **Jump server / bastion host** — hardened host you SSH/RDP through to reach internal systems. Heavily logged and monitored.
* **Sensor / collector** — captures traffic for IDS/SIEM.
* **NAC (Network Access Control)** — enforces policy on devices joining the network (posture: patched? AV running?). Often via 802.1X.

## Active vs. passive vs. inline
* **Inline** — must process; failure could break traffic.
* **Tap / Mirror** — copy of traffic; sensor failure doesn't affect production.
* **Active** — can take action (block).
* **Passive** — observes only.

## Fail mode
* **Fail-open** — keeps traffic flowing during a fault. Availability-first.
* **Fail-closed** — blocks all traffic on fault. Security-first.`
  },
  {
    id: "3.2b",
    domain: 3,
    title: "Secure Communications & Ports",
    estMinutes: 6,
    body: `## Secure protocols (memorize the pairs)
| Insecure | Secure | Port |
|---|---|---|
| HTTP (80) | **HTTPS** | 443 |
| FTP (21) | **FTPS** / **SFTP** | 990 / 22 |
| Telnet (23) | **SSH** | 22 |
| SMTP (25) | **SMTPS / SMTP+STARTTLS** | 465 / 587 |
| POP3 (110) | **POP3S** | 995 |
| IMAP (143) | **IMAPS** | 993 |
| LDAP (389) | **LDAPS** | 636 |
| SNMP v1/v2c | **SNMPv3** | 161/162 |
| DNS (53) | **DNS over TLS / HTTPS** | 853 / 443 |

## VPN options
* **Remote-access VPN** — user → corporate network. Protocols: **SSL/TLS VPN (HTTPS)**, **IPsec**.
* **Site-to-site VPN** — two networks linked over the internet via IPsec.
* **Always-on VPN** — auto-connects whenever the device is online.
* **Split tunnel** — only corp traffic goes over VPN. Faster, less secure.
* **Full tunnel** — all traffic via VPN. Slower, easier to inspect.

## IPsec
* **AH (Authentication Header)** — integrity + authentication; no encryption.
* **ESP (Encapsulating Security Payload)** — encryption + integrity + auth. The usual choice.
* **Transport mode** — encrypts the payload, leaves IP header intact.
* **Tunnel mode** — encrypts the whole packet, adds new IP header. Used for site-to-site.
* **IKE / IKEv2** — key exchange.

## Port security & 802.1X
* **Port security** — limit MAC addresses per switch port.
* **802.1X** — port-based authentication. Three roles:
  - **Supplicant** (client)
  - **Authenticator** (switch/AP)
  - **Authentication server** (RADIUS)
EAP variants: **EAP-TLS** (cert-based, strongest), **PEAP**, **EAP-TTLS**, **EAP-FAST**.

## SD-WAN & SASE
* **SD-WAN** — software-defined WAN; routes traffic over multiple links by policy.
* **SASE (Secure Access Service Edge)** — cloud-delivered networking + security (SWG, ZTNA, CASB, FWaaS) at the edge, close to users.
* **CASB (Cloud Access Security Broker)** — sits between users and cloud apps; enforces policy, DLP.`
  },
  {
    id: "3.3",
    domain: 3,
    title: "Data Classification & Protection",
    estMinutes: 6,
    body: `## Data types & sensitivity
* **Regulated** — governed by law (HIPAA PHI, GDPR personal data, PCI cardholder data).
* **Trade secret / IP** — proprietary value to the business.
* **Legal** — privileged communications.
* **Financial** — accounting, payroll.
* **Human-readable / non-human-readable** — text vs. machine-only formats.

## Classification levels (typical commercial)
* **Public** — anyone can see.
* **Internal / Private** — for employees only.
* **Confidential** — restricted to specific groups.
* **Restricted / Critical** — highest sensitivity; tightly controlled.

Government uses **Unclassified, Confidential, Secret, Top Secret**.

## States of data
* **Data at rest** — stored on disk/SSD/tape. Protect with **FDE / volume encryption / TDE**.
* **Data in transit (motion)** — over a network. Protect with **TLS / IPsec / SSH**.
* **Data in use (processing)** — in RAM/CPU. Protect with **memory encryption, secure enclaves, confidential computing**.

## Data sovereignty
Data is subject to the laws of the country it's stored in. EU GDPR cares whose **citizens'** data, plus where it's processed. Cloud customers must control region selection.

## Geolocation / geofencing
Restrict access to specific regions; useful for both **offensive** (geo-block hostile countries) and **defensive** (limit data export).

## Protection techniques
* **Encryption** — primary control for confidentiality.
* **Hashing** — integrity (and password storage).
* **Masking** — show partial value.
* **Tokenization** — substitute non-sensitive token.
* **Obfuscation** — make harder to read but not cryptographically secure.
* **Segmentation** — separate sensitive data into restricted environments (PCI scope reduction).
* **Permission restrictions** — least privilege.

## Data roles & responsibilities
* **Data owner** — accountable for the data (usually a senior business stakeholder).
* **Data controller** — decides why and how data is processed (GDPR term).
* **Data processor** — processes on behalf of the controller.
* **Data steward / custodian** — day-to-day handling, technical management.
* **DPO (Data Protection Officer)** — required by GDPR for some orgs; oversees privacy compliance.`
  },
  {
    id: "3.4",
    domain: 3,
    title: "Resilience, Backups & Recovery",
    estMinutes: 7,
    body: `## High availability vs. disaster recovery
* **HA** — keeps things running through small failures (server crash, AZ failure). Measured in nines.
* **DR** — restores after a major event (region down, ransomware, disaster). Measured in **RTO / RPO**.

## Key metrics
* **RTO (Recovery Time Objective)** — how long the business can tolerate being down.
* **RPO (Recovery Point Objective)** — how much data loss is acceptable (drives backup frequency).
* **MTTR (Mean Time To Repair)** — average time to recover.
* **MTBF (Mean Time Between Failures)** — reliability indicator.

## Site types
* **Hot site** — fully equipped, running, near-real-time data sync. Fast RTO, expensive.
* **Warm site** — equipped but not always running; needs data restored.
* **Cold site** — empty space with power and connectivity. Cheap, slow.
* **Cloud** — modern equivalent; spin up infrastructure on demand.
* **Geographic dispersion** — sites in different regions to survive regional disasters.

## Redundancy patterns
* **RAID** for disks (RAID 1 mirror, RAID 5 parity, RAID 10 mirror+stripe).
* **Clustering** for compute.
* **Load balancers** for service redundancy.
* **Multi-path** networking.
* **Generators + UPS** for power; **dual feeds** from different substations.

## Backup strategies
* **Full** — everything. Slow, simple restore.
* **Incremental** — only changes since the last backup of any kind. Fast backup, slower restore (need full + every incremental).
* **Differential** — changes since the last *full*. Larger backups but restore = full + 1 differential.
* **Snapshot** — point-in-time copy at storage layer.
* **Replication** — continuous copy elsewhere.
* **3-2-1 rule** — **3** copies, on **2** media, **1** offsite.
* **Offline / air-gapped** backups defeat ransomware that targets backups.
* **Immutable backups** (WORM) — can't be modified during retention.

## Testing recovery
* **Tabletop exercise** — discussion-based walkthrough.
* **Simulation / walkthrough** — step-by-step rehearsal.
* **Parallel test** — run recovery in parallel without cutting over.
* **Failover / full interruption** — actually cut over to the DR site. Highest confidence, highest risk.

## Power resiliency
* **UPS** — bridges short outages, allows clean shutdown.
* **Generator** — covers extended outages.
* **PDU** — distributes power within a rack; managed PDUs report usage.
* **Dual power supplies** in critical servers, fed from separate circuits.`
  },

  /* ============== DOMAIN 4 — Security Operations ============== */
  {
    id: "4.1",
    domain: 4,
    title: "Hardening, Wireless & Mobile Security",
    estMinutes: 7,
    body: `## Secure baselines
A **baseline** is the documented, approved configuration of a system. Process:
1. **Establish** — define what "secure" looks like (CIS Benchmarks are common starting points).
2. **Deploy** — image / push the baseline.
3. **Maintain** — drift detection, re-apply, update baseline as software changes.

## Hardening targets
Apply the same idea everywhere — workstations, servers, mobile, network gear, cloud, IoT, ICS, RTOS. Disable unused services, change default credentials, restrict admin, encrypt, log.

## Mobile deployment models
* **BYOD (Bring Your Own Device)** — user-owned. Privacy concerns; need MDM with containerization.
* **CYOD (Choose Your Own Device)** — user picks from approved list, company-owned.
* **COPE (Company Owned, Personally Enabled)** — fully managed, personal use allowed.
* **COBO (Company Owned, Business Only)** — strictest.

## MDM / UEM controls
* Encryption at rest, screen lock, remote wipe.
* App allow/block lists.
* Containerization (separate work/personal data).
* Geolocation, geofencing, screen capture restrictions.
* Push security policies; revoke if device leaves compliance.

## Connection methods
* **Cellular** — provider's network.
* **Wi-Fi** — local LAN; biggest attack surface.
* **Bluetooth** — pairing risks.
* **NFC** — short-range; payments, badges.

## Wireless security settings
* **WPA3** — current standard. **SAE (Simultaneous Authentication of Equals)** replaces the WPA2 4-way handshake — defeats offline brute force.
* **WPA2** still common. AES-CCMP cipher.
* **WEP, WPA, TKIP** — broken; do not use.

## 802.1X / Enterprise Wi-Fi
RADIUS-backed authentication. Each user authenticates individually with EAP (EAP-TLS strongest).

## Wi-Fi attack defenses
* Disable WPS.
* Strong passphrase or 802.1X.
* Hide guest from corporate via separate SSID + VLAN.
* WIDS/WIPS for rogue AP detection.

## Application security
* **Input validation** — never trust user input.
* **Secure cookies** — HttpOnly, Secure, SameSite.
* **Static (SAST) / Dynamic (DAST) testing**.
* **Sandboxing** for risky processes.
* **Code signing** to verify provenance.
* **Monitoring** — runtime application self-protection (RASP).`
  },
  {
    id: "4.2",
    domain: 4,
    title: "Asset Management",
    estMinutes: 4,
    body: `## You can't protect what you don't know about
Asset management is foundational. Most breach reports include "we didn't know that asset existed."

## Acquisition / procurement
* Purchase through approved channels (avoids counterfeit, ensures support).
* Vet vendors.
* Receive, log, image, baseline.

## Inventory
* **Asset list / CMDB** — what we own, where, who uses it, what it does.
* **Tagging** — physical labels + asset IDs in software.
* **Ownership** — every asset has an owner accountable for it.
* **Classification** — tied to data sensitivity hosted on the asset.

## Assignment / accountability
* Track who has the device.
* Acceptable use signed.

## Monitoring
* Patch status.
* Configuration drift.
* Location (especially for mobile).

## Disposal / decommissioning
* **Sanitization** — wipe data first.
  - **Clear** — overwrite (e.g., DoD 5220.22-M).
  - **Purge** — degauss (magnetic media), crypto-erase.
  - **Destroy** — shred, incinerate, pulverize. Required for highest sensitivity.
* **Certificate of destruction** — paperwork for audit.
* **Data retention** — destroy when retention period ends; **don't** keep data "just in case."`
  },
  {
    id: "4.3",
    domain: 4,
    title: "Vulnerability Management",
    estMinutes: 8,
    body: `## Identification methods
* **Vulnerability scanning** — automated tools (Nessus, Qualys, OpenVAS) check for known vulns.
* **Penetration testing** — humans actively exploit to prove impact.
* **Bug bounty** — pay external researchers for valid findings.
* **Application security testing** — SAST (source code), DAST (running app), IAST (instrumented), SCA (3rd-party libs).
* **Threat intelligence feeds** — vendor advisories, ISAC alerts.
* **Dark web monitoring** — leaked credentials.

## Static vs. Dynamic vs. Package
* **SAST** — analyze source code without running it. Catches injection, hardcoded secrets, insecure APIs early.
* **DAST** — test running app from outside. Catches runtime issues, auth flaws.
* **Package monitoring / SCA** — check 3rd-party libs against CVE databases (Snyk, Dependabot).

## Penetration testing types
* **Black box (unknown env)** — testers know nothing. Realistic external attacker.
* **White box (known env)** — full info; deeper coverage in less time.
* **Gray box (partially known)** — middle ground.
Engagement types:
* **Physical** — bypass locks, tailgate.
* **Offensive (red team)** — attackers.
* **Defensive (blue team)** — defenders.
* **Integrated (purple team)** — work together.
* **Reconnaissance** — passive (OSINT) and active (port scans).

## Analyzing vulnerabilities
* **CVE** — Common Vulnerabilities and Exposures — the unique ID for a known vuln (\`CVE-2024-12345\`).
* **CVSS** — Common Vulnerability Scoring System — 0–10 severity. Components: base, temporal, environmental.
* **Confirmation** — true positive vs. **false positive** vs. false negative.
* **Prioritization factors:**
  - **Exposure** — internet-facing > internal > air-gapped.
  - **Exploitability** — is there a public exploit? Is it being used (KEV)?
  - **Asset criticality** — production payment system > test box.
  - **Compensating controls** — already mitigated by WAF? Patched function not used?
  - **Risk tolerance** — business appetite.

## Remediation
* **Patching** — apply vendor update.
* **Configuration changes** — disable a service, change a default.
* **Insurance** — transfer financial risk.
* **Segmentation** — wall it off until you can patch.
* **Compensating controls** — WAF rule, IPS signature, account lockout.
* **Exception / exemption** — accept the risk, formally document.

## Validation
After remediation, **rescan** to confirm. Audit and report metrics over time.`
  },
  {
    id: "4.4",
    domain: 4,
    title: "Security Monitoring & Tools",
    estMinutes: 6,
    body: `## What gets monitored
* **Computing resources** — endpoints (EDR), servers, containers.
* **Applications** — logs, transactions, abnormal flows.
* **Infrastructure** — network devices, cloud services.

## Activities
* **Log aggregation** — ship logs to a central place.
* **Alerting** — rules / detections fire on suspicious patterns.
* **Reporting** — periodic summaries to leadership.
* **Archiving** — long-term storage for compliance / forensics.
* **Alert response and remediation / validation** — close the loop.

## Tools
* **SIEM (Security Information and Event Management)** — aggregates logs from many sources, correlates, alerts. Splunk, Sentinel, QRadar, Elastic SIEM.
* **SOAR (Security Orchestration, Automation, and Response)** — automates responses with playbooks (auto-isolate host, disable user).
* **EDR (Endpoint Detection and Response)** — continuously monitors endpoints; can hunt and respond.
* **XDR (Extended Detection and Response)** — EDR + network + email + cloud telemetry under one analytics layer.
* **DLP (Data Loss Prevention)** — detects/blocks sensitive data leaving (in email, USB, cloud upload).
* **SNMP traps** — devices push events to a manager.
* **NetFlow / IPFIX / sFlow** — metadata about traffic flows; quantity not content.
* **Vulnerability scanners** — Nessus, Qualys.
* **Antivirus / Anti-malware** — signature + behavior.
* **File integrity monitoring (FIM)** — alerts on changes to critical files (Tripwire, OSSEC).

## Benchmarks & alerting
* **Benchmark / baseline** — what's "normal" for this system.
* **Alerting tuning** — reduce false positives so analysts can focus.
* **Correlation rules** — combine events ("failed logon × 50 + successful logon" = brute force success).`
  },
  {
    id: "4.5",
    domain: 4,
    title: "Enterprise Security Capabilities",
    estMinutes: 7,
    body: `## Firewalls (revisited at the enterprise scale)
* **NGFW** — primary perimeter & east-west.
* **WAF** — protects HTTP apps.
* **Cloud firewalls / security groups** — per-instance.
* **Host-based firewalls** — on each endpoint.

## IDS / IPS
* **NIDS / NIPS** — network-based.
* **HIDS / HIPS** — host-based.

## Web filtering
* **Forward proxy** — every outbound request goes through it.
* **URL scanning** — block known-bad sites.
* **Content categorization** — block by category (gambling, malware, social).
* **Block rules / DNS filtering** — Cisco Umbrella, NextDNS.
* **Reputation services** — block based on IP/domain reputation.
* **Agent-based vs. centralized proxy** — agent works off-network too.

## Operating system security
* **Group Policy (Windows)** — central config & lockdown.
* **SELinux / AppArmor (Linux)** — Mandatory Access Control.

## Secure protocols (operations view)
Audit the network — replace anything cleartext (Telnet, FTP, HTTP) with secure peers.

## DNS Filtering
Block resolution of known-bad domains. Lightweight, very effective for malware C2 and phishing.

## Email security
* **DKIM (DomainKeys Identified Mail)** — sender signs the email with a key published in DNS; receiver verifies.
* **SPF (Sender Policy Framework)** — DNS record listing IPs allowed to send for the domain.
* **DMARC** — policy combining SPF + DKIM; tells receivers what to do (none / quarantine / reject) and where to send reports.
* **Email gateway** — sandboxing attachments, URL rewriting.

## File integrity monitoring (FIM)
Hashes critical files; alerts on change. Required by PCI for cardholder environments.

## DLP placement
* **Network DLP** — at egress.
* **Endpoint DLP** — agent on each device.
* **Storage DLP** — scan repositories.
* **Cloud DLP / CASB** — for SaaS.

## Endpoint security
* **EDR** — continuous monitoring + response.
* **Application allow lists**.
* **USB / removable-media control**.
* **Host firewall** + AV/EDR + FDE = baseline.

## Next-gen network access
* **NAC** — pre-admission posture checks.
* **ZTNA (Zero Trust Network Access)** — identity-aware proxy; replaces VPNs in many orgs.`
  },
  {
    id: "4.6a",
    domain: 4,
    title: "Identity & Access Management",
    estMinutes: 8,
    body: `## Lifecycle (Joiner / Mover / Leaver)
* **Provisioning** — create accounts when employees join.
* **Mover** — adjust access on role change. **Privilege creep** happens when old access isn't removed.
* **Deprovisioning** — disable on departure (don't delete immediately — preserve audit trail).
* **Permission assignment / implications** — who can do what; documented.

## Identity proofing
Verify the person is who they claim *before* issuing credentials.

## Federation & SSO
* **SSO (Single Sign-On)** — log in once, access many apps.
* **Federation** — trust between separate orgs/identity domains.
* **SAML** — XML-based, common for SaaS SSO. Roles: Identity Provider (IdP), Service Provider (SP), Principal (user).
* **OAuth 2.0** — authorization (delegated access), not authentication.
* **OpenID Connect (OIDC)** — authentication layer on top of OAuth 2.0.
* **LDAP** — directory protocol.

## Access control models
* **DAC (Discretionary)** — owner sets permissions (NTFS file permissions).
* **MAC (Mandatory)** — system-enforced based on labels (military: Top Secret).
* **RBAC (Role-Based)** — permissions tied to roles; assign roles to users. Most common in enterprises.
* **ABAC (Attribute-Based)** — policies evaluate attributes (department + location + time).
* **Rule-based** — generic conditional rules (e.g., no access after 6pm).
* **Time-of-day restrictions**.

## MFA factors (recap)
* Something you know / have / are / location / behavior.
* **Hardware tokens, smart cards, soft tokens (TOTP), push, biometrics, security keys (FIDO2)**.

## Password best practices
* **Length** > complexity.
* **Don't expire periodically without cause** (NIST 800-63B).
* **Block known-breached passwords** (HIBP).
* **Lockout after N failures**.
* **Password manager** strongly recommended.
* **Passwordless / passkeys (FIDO2)** — best of both worlds.

## Privileged Access Management (PAM)
* **Just-in-time (JIT) access** — elevate only for the moment needed.
* **Password vaulting** — credentials stored in vault, checked out per use, rotated.
* **Ephemeral credentials** — short-lived tokens (cloud roles, Vault).
* **Session recording** — for accountability.

## Account types
* **User**, **service**, **shared/generic** (avoid), **admin**, **guest**, **third-party / contractor**, **device**.`
  },
  {
    id: "4.7",
    domain: 4,
    title: "Automation & Orchestration",
    estMinutes: 5,
    body: `## Why automate
* Speed — minutes vs. hours.
* Consistency — no copy-paste typos.
* Scale — manage thousands of devices.
* Reduces human error.
* Frees skilled people for higher-value work.

## Use cases
* **User provisioning / deprovisioning** — auto-create on hire, disable on departure.
* **Resource provisioning** — IaC (Terraform).
* **Guard rails** — config policies (Azure Policy, AWS Config, OPA).
* **Security groups** — automate group membership based on attributes.
* **Ticket creation / escalation** — alerts auto-create incidents.
* **Service enabling / disabling** — turn off a risky service company-wide on detection.
* **Continuous integration / deployment** — automated tests + deploys with security gates.
* **API integrations** — connect SIEM → SOAR → ticket → comms.

## Considerations
* **Complexity** — automation can break in surprising ways.
* **Cost / ROI** — initial investment vs. ongoing savings.
* **Single point of failure** — orchestration platform itself.
* **Technical debt** — undocumented scripts no one understands.
* **Ongoing supportability** — who maintains the playbooks?

## Tooling
* **Configuration management** — Ansible, Chef, Puppet, SaltStack.
* **IaC** — Terraform, CloudFormation, Bicep, Pulumi.
* **CI/CD** — Jenkins, GitHub Actions, GitLab CI.
* **SOAR** — Cortex XSOAR, Splunk SOAR, Tines.`
  },
  {
    id: "4.8",
    domain: 4,
    title: "Incident Response",
    estMinutes: 8,
    body: `## NIST SP 800-61 IR lifecycle
1. **Preparation** — IR plan, tools, training, comms templates, contact tree.
2. **Detection & Analysis (Identification)** — confirm the event, scope it.
3. **Containment** — short-term (isolate host) and long-term (block IPs, change creds).
4. **Eradication** — remove malware, close the entry point.
5. **Recovery** — restore systems, monitor for recurrence.
6. **Lessons Learned (Post-incident)** — root-cause analysis, update playbooks.

## Process supporting elements
* **IR Policy** — high-level authority.
* **IR Plan** — strategy and roles.
* **IR Procedure / Runbooks** — step-by-step for specific incident types (ransomware, BEC, lost laptop).
* **Communication plan** — internal, customers, regulators, law enforcement, media.

## Exercises
* **Tabletop** — discussion-based scenario walkthrough; cheap, low risk.
* **Walkthrough** — step through procedures.
* **Simulation** — mock incident with realistic injects.
* **Full live test** — actual systems exercised.

## Threat hunting
*Proactive* search for compromise that hasn't triggered alerts. Hypothesis-driven, uses TTPs from frameworks like **MITRE ATT&CK**.

## Root cause analysis (RCA)
The "5 Whys" — keep asking why until you hit a systemic cause, not a symptom. Drives prevention.

## Digital forensics
* **Order of volatility** — collect from most to least volatile:
  1. CPU registers, cache
  2. RAM
  3. Network state, running processes
  4. Disk
  5. Backups, archives
* **Chain of custody** — who handled the evidence, when, where, why. Legally critical.
* **Forensic image** — bit-for-bit copy. Hash before and after to prove no change.
* **Write blocker** — prevents accidental modification of source media.
* **Reporting** — what was done, what was found, who did it.
* **e-Discovery** — legal process to identify and produce ESI (electronically stored information).
* **Preservation** — legal hold suspends normal data destruction.

## Log data sources
* Firewall, IDS/IPS, application, OS, authentication, packet captures, NetFlow, vulnerability scans, dashboards, automated reports.

## Time matters
* **Time synchronization (NTP)** is non-negotiable for forensics — correlated logs must share a clock.
* **Time zones / Time offsets** — use UTC for log storage; render local for analysts.`
  },

  /* ============== DOMAIN 5 — Governance, Risk & Compliance ============== */
  {
    id: "5.1",
    domain: 5,
    title: "Governance & Security Policies",
    estMinutes: 6,
    body: `## Governance hierarchy
* **Policies** — high-level "what." Approved by leadership.
* **Standards** — specific requirements ("what version, what config").
* **Procedures** — step-by-step "how."
* **Guidelines** — recommendations, not mandatory.

## Common policies
* **Acceptable Use Policy (AUP)** — what employees can/can't do with company resources.
* **Information Security Policy** — overarching security rules.
* **Business Continuity Policy** — keep operating during disruption.
* **Disaster Recovery Policy** — restore after disaster.
* **Incident Response Policy** — authority to act, roles.
* **Software Development Lifecycle (SDLC) Policy** — secure coding, code review, testing.
* **Change Management Policy** — who approves what.
* **Password Policy** — length, MFA, lockouts.
* **Data classification & handling**.
* **BYOD / mobile**.
* **Privacy policy**.

## Standards
* **Password standards** — specific rules (e.g., min 14 chars).
* **Access control standards** — RBAC, MFA required.
* **Physical security standards** — badge access, camera retention.
* **Encryption standards** — TLS 1.2+ in transit, AES-256 at rest.

## Procedures
* **Onboarding / offboarding**.
* **Change management procedures**.
* **Playbooks** — IR, vuln response.

## External considerations
* **Regulatory** — by industry/region (HIPAA, PCI DSS, GDPR, SOX).
* **Legal** — contracts, lawsuits, e-discovery.
* **Industry** — sector best practices (NIST CSF, ISO 27001).
* **Local / regional / national / global** — laws differ.

## Governance structures
* **Boards / Committees** — Audit committee, risk committee.
* **Government entities** — regulators.
* **Centralized vs. decentralized** — single security org vs. embedded teams in each business unit.

## Roles & responsibilities for data
(See Chapter 3.3 — Owner, Controller, Processor, Steward, Custodian, DPO.)

## Monitoring & revision
Policies are **living documents** — review annually or after major changes. Track approval, version, owner, next-review date.`
  },
  {
    id: "5.2",
    domain: 5,
    title: "Risk Management",
    estMinutes: 7,
    body: `## Risk identification
List threats × vulnerabilities × assets.

## Risk assessment types
* **Ad hoc** — one-off, often after an event.
* **Recurring** — scheduled (quarterly, annual).
* **One-time** — for a specific project.
* **Continuous** — ongoing via tools (CSPM, vuln scanners).

## Risk analysis
* **Qualitative** — high/medium/low ratings; uses judgment. Quick.
* **Quantitative** — calculate dollar impact.
  - **AV (Asset Value)** — what the asset is worth.
  - **EF (Exposure Factor)** — % of asset value lost per event.
  - **SLE (Single Loss Expectancy)** = AV × EF.
  - **ARO (Annualized Rate of Occurrence)** — events/year.
  - **ALE (Annualized Loss Expectancy)** = SLE × ARO.
  - **Compare ALE to control cost** — spend less than the loss.

## Risk register
A document tracking each risk: description, owner, likelihood, impact, mitigation, status.
* **KRI (Key Risk Indicator)** — early warning metric.
* **Risk owner** — accountable person.
* **Risk threshold / appetite / tolerance** — how much risk leadership accepts.

## Risk treatment strategies
* **Mitigate** — reduce (apply controls).
* **Transfer** — pass to a third party (insurance, outsourcing).
* **Accept** — acknowledge and live with it. Document the decision.
  - **Exemption** — formal carve-out from a policy.
  - **Exception** — temporary deviation.
* **Avoid** — don't do the activity.

## Business Impact Analysis (BIA)
Identify critical processes and the impact of their disruption.
* **RTO** — how long can we be down?
* **RPO** — how much data can we lose?
* **MTTR** — how long to fix?
* **MTBF** — how often do failures occur?
* **Critical functions / dependencies** — what depends on what.
* **Recovery priorities** — order of restoration.`
  },
  {
    id: "5.3",
    domain: 5,
    title: "Third-Party Risk & Agreements",
    estMinutes: 6,
    body: `## Why third-party risk matters
You inherit your vendors' security posture. Big breaches (Target HVAC vendor, SolarWinds, Kaseya) start in the supply chain.

## Vendor selection
* **Due diligence** — security questionnaires (SIG, CAIQ), reference checks.
* **Conflict of interest** — disclose any.
* **Right-to-audit clause** — contractually allow you to audit them.
* **Evidence of internal audits**.
* **Independent assessments** — SOC 2 Type II, ISO 27001, FedRAMP.
* **Supply chain analysis** — their vendors are now your fourth parties.

## Agreement types
* **NDA (Non-Disclosure Agreement)** — protects confidential info.
* **MOA (Memorandum of Agreement)** — formal but less than a contract.
* **MOU (Memorandum of Understanding)** — informal intent.
* **MSA (Master Service Agreement)** — umbrella for ongoing engagements.
* **SOW (Statement of Work)** — specific deliverables under an MSA.
* **SLA (Service Level Agreement)** — performance metrics + penalties.
* **BPA (Business Partnership Agreement)** — defines partnership terms.
* **WO / Work Order** — task-level engagement.

## Vendor monitoring
* Continuous reassessment (security scores, news monitoring).
* Performance against SLAs.
* Periodic re-questionnaires.

## Questionnaires
Industry standards: **SIG (Standardized Information Gathering)**, **CAIQ (Consensus Assessments Initiative Questionnaire)**.

## Rules of engagement
For pen tests or third parties touching your environment — what's in scope, when, who to call.`
  },
  {
    id: "5.4",
    domain: 5,
    title: "Compliance & Privacy",
    estMinutes: 6,
    body: `## Compliance reporting
* **Internal reporting** — to leadership, board.
* **External reporting** — to regulators, customers, public (breach notifications).

## Consequences of non-compliance
* **Fines** — GDPR up to 4% of global revenue.
* **Sanctions** — loss of license to operate.
* **Reputational damage** — customer trust loss.
* **Loss of license** — for licensed industries.
* **Contractual impacts** — breach of customer contracts.

## Compliance monitoring
* **Due diligence / care** — taking reasonable steps.
* **Attestation and acknowledgment** — formal sign-off by responsible party.
* **Internal vs. external monitoring** — both required.
* **Automation** — continuous compliance checks (CSPM, GRC tools).

## Privacy
* **Legal implications** — varies by jurisdiction. **Local, regional, national, global**.
  - **GDPR** (EU) — broad data rights for EU residents.
  - **CCPA / CPRA** (California) — California consumer rights.
  - **HIPAA** (US) — health information.
  - **PCI DSS** — payment card data (industry standard, not law).
  - **SOX** — public company financial controls.
  - **GLBA** — financial institutions.
  - **FERPA** — education records.

## Data subject rights (GDPR)
* Right to be informed
* Right of access
* Right to rectification
* Right to erasure ("right to be forgotten")
* Right to restrict processing
* Right to data portability
* Right to object

## Privacy roles
* **Data subject** — the person the data is about.
* **Data controller** — decides why/how data is processed.
* **Data processor** — processes on behalf of the controller.
* **DPO (Data Protection Officer)** — required by GDPR for many orgs.

## Data inventory & retention
Know what data you hold, why, where, and **for how long**. Destroy when no longer needed.`
  },
  {
    id: "5.5",
    domain: 5,
    title: "Audits & Assessments",
    estMinutes: 6,
    body: `## Attestation
A formal statement by an authorized party that something is true (e.g., management attests to security controls).

## Internal audits
* **Compliance** — checks adherence to policies and regulations.
* **Audit committee** — board-level oversight.
* **Self-assessment** — periodic check by the team.

## External audits
* **Regulatory** — government bodies.
* **Examinations** — formal reviews by regulators.
* **Assessments by external firms** — SOC 2 (AICPA), ISO 27001 audits.
* **Independent third-party audit** — provides credibility.

## Penetration testing (governance lens)
* **Physical** — buildings, badges, social engineering.
* **Offensive (red team)** — simulate adversaries.
* **Defensive (blue team)** — measure how detection/response performs.
* **Integrated (purple team)** — collaborative.
* **Reconnaissance** — passive (OSINT) or active (scanning).

## Pen-test environment knowledge
* **Known environment (white box)** — testers have full info.
* **Partially known (gray box)** — some info.
* **Unknown environment (black box)** — none. Realistic external attacker.

## Audit reports
* **SOC 1 / SOC 2 / SOC 3** — service org controls.
* **SOC 2 Type I** — design as of a date.
* **SOC 2 Type II** — operating effectiveness over a period (usually 6–12 months).
* **ISO 27001 certificate** — formal certification.

## Frameworks (vocabulary)
* **NIST CSF** — Identify, Protect, Detect, Respond, Recover (now also Govern in CSF 2.0).
* **NIST SP 800-53** — control catalog.
* **ISO/IEC 27001 & 27002** — ISMS standard + control set.
* **CIS Controls / Benchmarks** — practical, prioritized.
* **PCI DSS** — payment card.
* **HIPAA / HITRUST**, **FedRAMP**, **CMMC**.`
  },
  {
    id: "5.6",
    domain: 5,
    title: "Security Awareness & Training",
    estMinutes: 5,
    body: `## Why awareness is a control
Most successful attacks need a human to click, plug in, or share. Trained users dramatically reduce success rate.

## Program elements
* **Phishing simulation campaigns** — measure click rate, report rate; trend over time.
* **Recognizing suspicious behavior** — anomalous messages, tailgaters, USB drops.
* **Anomalous behavior recognition** — risky, unexpected, unintentional.
* **Reporting and monitoring** — easy report-phish button; reward reporting.
* **Initial training** — for new hires.
* **Recurring training** — at least annual.
* **Development and execution** — content, delivery, tracking.

## User guidance & training topics
* **Policy / handbook acknowledgment**.
* **Situational awareness** — be wary of unsolicited contact.
* **Insider threat** signs.
* **Password management** — managers, MFA, no reuse.
* **Removable media & cables** — don't plug in unknown.
* **Social engineering tactics** — pretexting, urgency, authority.
* **Operational security** — don't overshare on social media (LinkedIn, OOO replies).
* **Hybrid / remote work environments** — secure home Wi-Fi, screen privacy, family device separation.

## Reporting & monitoring
* Clear, frictionless reporting channels.
* Rewards / recognition for good security behavior.
* Dashboards on training completion + phishing metrics.

## Development & execution
* **Engagement** beats content volume — short, frequent, scenario-based modules outperform once-a-year videos.
* **Role-based** content — execs need different training than devs.
* **Measure** what matters — click rates, report rates, time-to-report.`
  }
];

/* ============================== QUESTION BANK ==============================
   ~250 questions across all 5 domains. Format:
   { id, domain, q, options: [a,b,c,d], answer: 0..3, explain, explainSk? }
*/
const QUESTIONS = [

  /* ===== DOMAIN 1 ===== */
  { id: "q001", domain: 1, q: "Which of the following BEST describes the difference between an IDS and an IPS?", options: ["IDS encrypts traffic; IPS does not","IDS is passive and alerts; IPS is inline and blocks","IDS works at Layer 2; IPS at Layer 7","There is no functional difference"], answer: 1, explain: "An IDS detects and alerts on suspicious activity (out-of-band/passive). An IPS sits inline and can actively block malicious traffic.", explainSk: "IDS odhaľuje podozrivú aktivitu a len upozorní (pasívne, mimo pásma). IPS sedí priamo v toku a vie aktívne blokovať škodlivú premávku." },
  { id: "q002", domain: 1, q: "An organization wants to verify that downloaded software has not been altered. Which control provides this?", options: ["Symmetric encryption","Hashing","Tokenization","Steganography"], answer: 1, explain: "Hashing produces a fixed-length fingerprint of data. Comparing the published hash to one you compute confirms integrity.", explainSk: "Hashing vytvorí pevnú dĺžku odtlačku (digest) dát. Porovnaním zverejneného hashu s vlastným výpočtom overíš, či sa súbor nezmenil — integrita." },
  { id: "q003", domain: 1, q: "Which control category does a security awareness program BEST fit into?", options: ["Technical","Physical","Operational","Compensating"], answer: 2, explain: "Awareness programs are operational controls — they are implemented by people, not systems.", explainSk: "Program bezpečnostného povedomia je prevádzková (operational) kontrola — realizujú ju ľudia a procesy, nie len automatické systémy." },
  { id: "q004", domain: 1, q: "A bollard at a building's entrance is BEST classified as which control type?", options: ["Detective","Preventive","Corrective","Directive"], answer: 1, explain: "A bollard physically prevents vehicles from accessing the area — it's a preventive (and physical) control.", explainSk: "Zátaras (bollard) fyzicky bráni vjazdu vozidla — ide o preventívnu (a zároveň fyzickú) kontrolu." },
  { id: "q005", domain: 1, q: "Which of the following provides non-repudiation?", options: ["AES encryption","Symmetric MAC","Digital signature","Salt + hash"], answer: 2, explain: "A digital signature uses the sender's private key, so only that sender could have produced it — non-repudiation.", explainSk: "Digitálny podpis používa súkromný kľúč odosielateľa, takže ho nemohol vyrobiť nik iný — zabezpečuje nepopierateľnosť pôvodu." },
  { id: "q006", domain: 1, q: "In Zero Trust architecture, which component makes the access decision?", options: ["Policy Enforcement Point (PEP)","Policy Engine","Implicit trust zone","Subject"], answer: 1, explain: "The Policy Engine evaluates conditions and produces a decision; the PEP enforces it.", explainSk: "Policy Engine vyhodnotí podmienky a vydá rozhodnutie o prístupe; Policy Enforcement Point (PEP) ho vynútí v premávke." },
  { id: "q007", domain: 1, q: "An attacker captures an authentication packet and resends it later to gain access. Which mitigation is MOST effective?", options: ["Longer passwords","Nonces and timestamps","Disabling SSH","Stronger encryption keys"], answer: 1, explain: "Nonces and timestamps make each authentication unique, defeating replay attacks.", explainSk: "Nonce a časové pečiatky robia každú autentifikáciu jedinečnou, takže opätovné prehratie starého paketu (replay) zlyhá." },
  { id: "q008", domain: 1, q: "Which factor combination represents true MFA?", options: ["Password and PIN","Smart card and PIN","Password and security question","Two different passwords"], answer: 1, explain: "Smart card (something you have) + PIN (something you know) are different factors. Two passwords are both 'something you know.'", explainSk: "Čipová karta (niečo, čo máš) + PIN (niečo, čo vieš) sú dva rôzne faktory. Dve heslá sú stále len „niečo, čo vieš“ — to nie je MFA." },
  { id: "q009", domain: 1, q: "Which protocol uses a Key Distribution Center (KDC) and is sensitive to clock skew?", options: ["RADIUS","Kerberos","TACACS+","LDAP"], answer: 1, explain: "Kerberos uses a KDC and time-bound tickets, requiring synchronized clocks (typically within 5 minutes).", explainSk: "Kerberos používa KDC a časovo viazané tickety, preto musia byť hodiny synchronizované (typicky do pár minút)." },
  { id: "q010", domain: 1, q: "Which of the following BEST describes a honeyfile?", options: ["A single decoy server","A network of decoy systems","A bait file that triggers an alert when accessed","Encrypted backup of credentials"], answer: 2, explain: "A honeyfile looks attractive (e.g., 'passwords.xlsx') and alerts when anyone touches it.", explainSk: "Honeyfile vyzerá lákavo (napr. „heslá.xlsx“) a pri otvorení spustí upozornenie — ide o návnadový súbor." },
  { id: "q011", domain: 1, q: "An organization compares its current controls against the NIST CSF to identify weaknesses. This activity is BEST called:", options: ["Gap analysis","Risk transfer","Penetration test","Threat modeling"], answer: 0, explain: "Comparing current state to a desired state (a framework) is the definition of gap analysis.", explainSk: "Porovnanie súčasného stavu kontrol s cieľovým stavom (rámec, norma) je definícia medzery — gap analysis." },
  { id: "q012", domain: 1, q: "Which is the MOST important reason to maintain a backout plan during change management?", options: ["To document the change request","To ensure a rapid revert if the change fails","To get budget approval","To meet auditor requirements"], answer: 1, explain: "A backout plan exists so the team can quickly restore service if the change has unintended impact.", explainSk: "Plán návratu (backout) umožní rýchlo vrátiť službu do funkčného stavu, ak zmena spôsobí problémy." },
  { id: "q013", domain: 1, q: "Which type of encryption is fastest and best suited for bulk data?", options: ["Asymmetric","Symmetric","Hashing","Public-key"], answer: 1, explain: "Symmetric encryption uses one key and is much faster than asymmetric — used for bulk data, often with a key exchanged via asymmetric crypto.", explainSk: "Symetrické šifrovanie jedným kľúčom je oveľa rýchlejšie ako asymetrické — vhodné na objemy dát; kľúč sa často vymení asymetricky." },
  { id: "q014", domain: 1, q: "What is the PRIMARY purpose of a salt in password hashing?", options: ["Speed up hashing","Defeat rainbow-table attacks","Encrypt the password","Replace the need for hashing"], answer: 1, explain: "A unique salt per password ensures the same password produces different hashes, defeating precomputed rainbow tables.", explainSk: "Jedinečná soľ na heslo znamená, že rovnaké heslo dá rôzne hashe — znemožní to predpočítané dúhové tabuľky." },
  { id: "q015", domain: 1, q: "Which certificate type is BEST for a domain that needs to secure both example.com AND many subdomains like a.example.com?", options: ["Self-signed","Wildcard","SAN with each subdomain listed","Code-signing"], answer: 1, explain: "A wildcard certificate (*.example.com) covers all subdomains at one level under example.com.", explainSk: "Wildcard certifikát (*.example.com) pokrýva všetky subdomény jednej úrovne pod danou doménou." },
  { id: "q016", domain: 1, q: "Which mechanism allows a server to attach the OCSP response in the TLS handshake to improve performance?", options: ["CRL","OCSP stapling","Pinning","HSTS"], answer: 1, explain: "OCSP stapling lets the server fetch and 'staple' the OCSP response, eliminating the client lookup.", explainSk: "OCSP stapling: server si vopred stiahne odpoveď OCSP a „pripne“ ju do TLS handshaku, klient nemusí robiť samostatný dotaz." },
  { id: "q017", domain: 1, q: "A device that securely stores and performs cryptographic operations on tamper-resistant hardware is called a:", options: ["TPM","HSM","Secure enclave","KMS"], answer: 1, explain: "An HSM is dedicated tamper-resistant hardware. A TPM is a similar concept but lives on a motherboard for a single host.", explainSk: "HSM je špecializovaný odolný hardvér na kryptografiu. TPM je podobný koncept, ale je na doske konkrétneho hostiteľa." },
  { id: "q018", domain: 1, q: "Tokenization is MOST commonly used to:", options: ["Replace sensitive PCI data with a non-sensitive substitute","Encrypt files at rest","Hash passwords","Detect malware"], answer: 0, explain: "Tokenization substitutes a non-sensitive token for sensitive data (e.g., credit card numbers), with the original stored in a vault.", explainSk: "Tokenizácia nahrádza citlivé údaje (napr. číslo karty) netcitlivým tokenom; originál je v trezore." },
  { id: "q019", domain: 1, q: "Which is a key property that makes a blockchain tamper-evident?", options: ["Centralized authority","Each block contains the hash of the previous block","Use of asymmetric encryption only","Real-time replication"], answer: 1, explain: "Each block's hash incorporates the prior block's hash, so altering any block invalidates every later one.", explainSk: "Hash každého bloku obsahuje hash predchádzajúceho bloku — zmena jedného bloku znehodnotí reťazec." },
  { id: "q020", domain: 1, q: "Which cryptographic property makes finding two inputs with the same digest infeasible?", options: ["Avalanche effect","Collision resistance","Determinism","Reversibility"], answer: 1, explain: "Collision resistance — a strong hash should make it computationally infeasible to find two different inputs that hash to the same value.", explainSk: "Odolnosť voči kolízii: silný hash má byť výpočtovo nezvládnuteľné nájsť dva rôzne vstupy s rovnakým digestom." },
  { id: "q021", domain: 1, q: "Which of the following is an example of a directive control?", options: ["Firewall rule","Posted 'Authorized Personnel Only' sign","Backup restoration","Motion detector"], answer: 1, explain: "A directive control instructs subjects what to do; signage and policies are classic directive controls.", explainSk: "Direktívna kontrola hovorí subjektom, čo majú robiť — cedule, zásady a podobne." },
  { id: "q022", domain: 1, q: "Which is BEST described as a compensating control?", options: ["Replacing a vulnerable app with a patched one","Using a host firewall to block exploitation while waiting on a vendor patch","Posting an AUP","Performing a vulnerability scan"], answer: 1, explain: "A compensating control mitigates risk when the primary control isn't available — like using a firewall rule until a patch is released.", explainSk: "Kompenzačná kontrola zmierňuje riziko, keď primárna kontrola chýba — napr. FW pravidlo, kým nevyjde patch." },
  { id: "q023", domain: 1, q: "An employee uses a fingerprint plus a hardware token to log in. This is an example of:", options: ["Single-factor authentication","Two-factor authentication","SSO","Federation"], answer: 1, explain: "Two factors from different categories (something you are + something you have) = MFA/2FA.", explainSk: "Dva faktory z rôznych kategórií (biometria + token) = MFA/2FA." },
  { id: "q024", domain: 1, q: "Which is the PRIMARY advantage of asymmetric encryption over symmetric?", options: ["Faster performance","No need to securely exchange a shared key","Smaller key sizes for the same strength","Resistance to quantum attacks"], answer: 1, explain: "Asymmetric crypto removes the need to pre-share a secret key; the public key can be shared openly.", explainSk: "Asymetrická kryptografia nevyžaduje vopred zdieľať tajný kľúč; verejný kľúč môže byť verejný." },
  { id: "q025", domain: 1, q: "Which is the RECOMMENDED minimum modern symmetric block cipher and key length?", options: ["DES 56-bit","3DES 112-bit","AES 128-bit","RC4 128-bit"], answer: 2, explain: "AES with 128-bit (or larger) keys is the current accepted standard.", explainSk: "Aktuálny štandard je AES s kľúčom aspoň 128 bitov (alebo dlhším)." },
  { id: "q026", domain: 1, q: "Which control category does Group Policy fall under?", options: ["Operational","Physical","Technical","Managerial"], answer: 2, explain: "Group Policy is implemented by a system to enforce settings — a technical control.", explainSk: "Group Policy vynucuje nastavenia cez systém — technická kontrola." },
  { id: "q027", domain: 1, q: "What does the 'I' in CIA Triad ensure?", options: ["Information is accessible","Information has not been altered","Information is private","Information is auditable"], answer: 1, explain: "Integrity ensures data has not been changed (or alteration is detectable).", explainSk: "Písmeno I v CIA znamená integritu — dáta sa nezmenili (alebo je zmena zistiteľná)." },
  { id: "q028", domain: 1, q: "Which authentication protocol encrypts only the password and uses UDP?", options: ["TACACS+","RADIUS","Kerberos","LDAPS"], answer: 1, explain: "RADIUS uses UDP and encrypts only the password field. TACACS+ uses TCP and encrypts the whole payload.", explainSk: "RADIUS používa UDP a šifruje len pole hesla. TACACS+ používa TCP a šifruje celý payload." },

  /* ===== DOMAIN 2 ===== */
  { id: "q101", domain: 2, q: "Which threat actor is BEST characterized as well-funded, patient, and motivated by espionage?", options: ["Script kiddie","Hacktivist","Nation-state / APT","Insider"], answer: 2, explain: "Nation-state actors / APTs have substantial funding, time horizons measured in years, and espionage or strategic disruption goals.", explainSk: "Štátne / APT skupiny majú veľké financie, dlhodobé horizonty a ciele ako špionáž alebo strategické narušenie." },
  { id: "q102", domain: 2, q: "An attacker registers 'paypa1.com' to fool users. This is BEST called:", options: ["Pharming","Typosquatting","Watering-hole attack","Smishing"], answer: 1, explain: "Typosquatting registers a domain that's a misspelling of a real one to capture users who mistype.", explainSk: "Typosquatting zaregistruje doménu s preklepom oproti pravej, aby chytil používateľov, ktorí zle napíšu adresu." },
  { id: "q103", domain: 2, q: "An attacker compromises a popular industry forum to infect its visitors. This is a:", options: ["Watering-hole attack","Whaling attack","Vishing attack","Pharming attack"], answer: 0, explain: "Watering-hole attacks compromise sites a target group regularly visits, infecting them when they go.", explainSk: "Útok na miesto, ktoré cieľová skupina pravidelne navštevuje (watering-hole), kompromituje stránku a infikuje návštevníkov." },
  { id: "q104", domain: 2, q: "Which attack involves writing past the end of a buffer to overwrite the return address?", options: ["SQL injection","Cross-site scripting","Buffer overflow","Race condition"], answer: 2, explain: "A classic buffer overflow overwrites adjacent memory, potentially the function's return address, redirecting execution.", explainSk: "Klasický buffer overflow prepíše susednú pamäť (napr. návratovú adresu funkcie) a zmení beh programu." },
  { id: "q105", domain: 2, q: "Which is the BEST defense against SQL injection?", options: ["WAF only","Stored procedures only","Parameterized queries / prepared statements","Network segmentation"], answer: 2, explain: "Parameterized queries treat user input as data, never code, eliminating the root cause of injection.", explainSk: "Parametrizované dotazy (prepared statements) berú vstup ako dáta, nie ako kód — odstraňujú koreň SQL injection." },
  { id: "q106", domain: 2, q: "Which type of XSS is stored on the server and served to subsequent visitors?", options: ["Reflected","Stored / persistent","DOM-based","Blind"], answer: 1, explain: "Stored XSS is persisted on the server (e.g., in a comment) and runs in every visitor's browser.", explainSk: "Uložené (persistentné) XSS zostáva na serveri (napr. v komentári) a spustí sa u každého ďalšieho návštevníka." },
  { id: "q107", domain: 2, q: "Which is a TOCTOU vulnerability?", options: ["Buffer overflow","Race condition where state changes between check and use","SQL injection variant","Memory leak"], answer: 1, explain: "Time-Of-Check / Time-Of-Use is a race condition where the state changes between when it was validated and when it was used.", explainSk: "TOCTOU: medzi kontrolou stavu a použitím sa stav zmení — typ pretečenia časovej medzery." },
  { id: "q108", domain: 2, q: "Which malware self-propagates over a network without user interaction?", options: ["Virus","Worm","Trojan","Adware"], answer: 1, explain: "A worm is self-replicating and self-propagating; a virus needs a host file and user action.", explainSk: "Červ (worm) sa sám replikuje a šíri po sieti; vírus potrebuje hostiteľský súbor a často akciu používateľa." },
  { id: "q109", domain: 2, q: "Which malware typically uses PowerShell or WMI and lives only in memory?", options: ["Boot sector virus","Fileless malware","Adware","Bloatware"], answer: 1, explain: "Fileless malware leverages legitimate system tools (LOLBins) and resides in memory to evade signature-based AV.", explainSk: "Bezsúborový malware využíva legitímne nástroje OS (PowerShell, WMI) a žije v pamäti, aby obišiel signatúrové AV." },
  { id: "q110", domain: 2, q: "An attacker gains access using a captured NTLM hash without ever knowing the cleartext password. This is:", options: ["Credential stuffing","Pass-the-hash","Rainbow-table attack","Brute force"], answer: 1, explain: "Pass-the-hash uses the hash as the credential — common in Windows lateral movement.", explainSk: "Pass-the-hash používa ukradnutý hash ako prihlasovacie tajomstvo — bežné pri laterálnom pohybe vo Windows." },
  { id: "q111", domain: 2, q: "An attacker tries the same common password against many user accounts. This is:", options: ["Brute force","Dictionary","Password spraying","Credential stuffing"], answer: 2, explain: "Spraying tries a few common passwords against many accounts to avoid lockout thresholds.", explainSk: "Password spraying vyskúša málo bežných hesiel proti mnohým účtom, aby sa nestretol s prísnym zamykaním." },
  { id: "q112", domain: 2, q: "Which is the MOST effective defense against rainbow-table attacks on stored passwords?", options: ["Longer hashes","Salting","Symmetric encryption","HMAC"], answer: 1, explain: "Salting ensures the same password hashes differently for each user, defeating precomputed lookup tables.", explainSk: "Soľ zaručí, že rovnaké heslo má u každého používateľa iný hash — porazí predpočítané dúhové tabuľky." },
  { id: "q113", domain: 2, q: "Which is the PRIMARY defense against ARP poisoning on a LAN?", options: ["VLAN segmentation and Dynamic ARP Inspection","Stronger Wi-Fi password","HTTPS everywhere","Port 22 firewall rules"], answer: 0, explain: "DAI (often combined with DHCP snooping) validates ARP packets against trusted bindings; VLAN segmentation limits scope.", explainSk: "DAI (Dynamic ARP Inspection) s DHCP snoopingom overuje ARP voči dôveryhodným väzbám; VLAN segmentácia obmedzí dosah." },
  { id: "q114", domain: 2, q: "An attacker stands up a Wi-Fi SSID identical to a corporate one to lure clients. This is:", options: ["Bluejacking","Evil twin","SSL stripping","Pharming"], answer: 1, explain: "Evil twin = a rogue AP impersonating a legitimate SSID to capture credentials and traffic.", explainSk: "Evil twin je falošný prístupový bod s rovnakým SSID ako legitímna sieť, aby zachytil prihlasovanie a premávku." },
  { id: "q115", domain: 2, q: "Which DNS-based defense uses cryptographic signatures to validate responses?", options: ["DNS over TLS","DNSSEC","DNS over HTTPS","Split-horizon DNS"], answer: 1, explain: "DNSSEC adds digital signatures to DNS responses so resolvers can verify authenticity.", explainSk: "DNSSEC pridáva digitálne podpisy k odpovediam DNS, aby resolver overil autenticitu." },
  { id: "q116", domain: 2, q: "Which BEST describes a zero-day vulnerability?", options: ["A vulnerability in a system older than ten years","A vulnerability that has been patched but not deployed","A vulnerability unknown to the vendor with no patch available","A vulnerability that requires admin access"], answer: 2, explain: "Zero-days are unknown to the vendor; no patch yet exists, so defense relies on layered, behavior-based protections.", explainSk: "Zero-day je zraniteľnosť, o ktorej dodávateľ ešte nevie a neexistuje patch — obrana je vrstvená a správaním." },
  { id: "q117", domain: 2, q: "An attacker gets a privileged user to download a backdoored driver in a fake software update. This is BEST called:", options: ["Watering-hole attack","Supply-chain attack","Phishing","Replay attack"], answer: 1, explain: "Compromising the software update mechanism (or vendor) to deliver malware is a supply-chain attack (e.g., SolarWinds).", explainSk: "Kompromitovanie reťazca dodávateľa alebo aktualizácií na doručenie malwaru je supply-chain útok (napr. SolarWinds)." },
  { id: "q118", domain: 2, q: "Which is the FIRST priority when an organization detects active ransomware spreading on its network?", options: ["Identify the variant","Contain by isolating affected hosts","Notify the press","Pay the ransom"], answer: 1, explain: "Containment limits the blast radius. Identification and other steps follow once spread is stopped.", explainSk: "Pri šíriacom sa ransomware treba najprv izolovať hostiteľov (kontajment), aby sa zastavil dosah; identifikácia potom." },
  { id: "q119", domain: 2, q: "Which framework catalogs adversary tactics, techniques, and procedures by phase?", options: ["MITRE ATT&CK","NIST CSF","COBIT","ITIL"], answer: 0, explain: "MITRE ATT&CK organizes real-world TTPs across the kill chain and is widely used for detection engineering and threat hunting.", explainSk: "MITRE ATT&CK katalogizuje reálne taktiky a techniky protivníka podľa fáz kill chain — pre detekciu a lov hrozieb." },
  { id: "q120", domain: 2, q: "Which IoC pattern is BEST evidence of credential abuse via 'impossible travel'?", options: ["Single login from a known IP","Two successful logins from different continents within a few minutes","High CPU on the user's workstation","Multiple failed logins from one IP"], answer: 1, explain: "Successful logins from far-apart geographies in a short window indicate credential theft (impossible travel).", explainSk: "Dva úspešné loginy z veľmi vzdialených miest v krátkom čase naznačujú krádež prihlasovacích údajov (nemožná cesta)." },
  { id: "q121", domain: 2, q: "Which mitigation BEST helps when a critical legacy app cannot be patched?", options: ["Decommission immediately","Network segmentation and compensating controls","Apply the patch anyway","Add to internet-facing DMZ"], answer: 1, explain: "Wrap unpatchable systems in compensating controls (segmentation, monitoring, restricted access).", explainSk: "Nedá sa patchnúť — obal kompenzačnými kontrolami: segmentácia, monitoring, obmedzený prístup." },
  { id: "q122", domain: 2, q: "Which mitigation is MOST effective against phishing of user passwords?", options: ["Stronger passwords only","Email banners","Phishing-resistant MFA (e.g., FIDO2)","Daily password rotation"], answer: 2, explain: "FIDO2/WebAuthn keys are origin-bound and resist phishing even if the user is fooled.", explainSk: "FIDO2/WebAuthn kľúče sú viazané na pôvod a odolávajú phishingu aj pri oklamaní používateľa." },
  { id: "q123", domain: 2, q: "Which is an example of a logic bomb?", options: ["A worm spreading via SMB","Code that deletes files on a specific date","A keylogger sending keystrokes to an attacker","A trojan disguised as a game"], answer: 1, explain: "A logic bomb triggers on a condition (date, event). It's often planted by insiders.", explainSk: "Logická bomba sa spustí pri podmienke (dátum, udalosť); často ju zasadí insider." },
  { id: "q124", domain: 2, q: "Which attack abuses a server to perform requests on behalf of an attacker, often hitting internal-only systems?", options: ["XSS","CSRF","SSRF","SQLi"], answer: 2, explain: "Server-Side Request Forgery (SSRF) tricks a server into making attacker-chosen requests, often pivoting to internal services.", explainSk: "SSRF donúti server vykonať požiadavky útočníka, často smerom na interné služby nedostupné z internetu." },
  { id: "q125", domain: 2, q: "Which best mitigates CSRF?", options: ["Anti-CSRF tokens and SameSite cookies","Account lockout","File integrity monitoring","Stronger TLS ciphers"], answer: 0, explain: "Anti-CSRF tokens validate that the request originated from the legitimate UI; SameSite cookies prevent cross-site send.", explainSk: "Anti-CSRF tokeny overia, že požiadavka pochádza z legitímneho UI; SameSite obmedzí odoslanie z iných stránok." },
  { id: "q126", domain: 2, q: "An attacker overwhelms a target with a flood of DNS responses caused by spoofed requests to open resolvers. This is:", options: ["DNS poisoning","DNS amplification DDoS","DNS hijacking","DNS tunneling"], answer: 1, explain: "Amplification DDoS leverages services that respond with much more data than the request, with spoofed source IPs.", explainSk: "DNS amplifikácia: sfalšovaná zdrojová IP a otvorené resolvery vygenerujú obrovskú odozvu na obeť." },
  { id: "q127", domain: 2, q: "Which BEST describes shadow IT?", options: ["IT systems exposed to the internet","Systems used by employees outside official IT sanction","Backup systems in a cold site","Honeypot infrastructure"], answer: 1, explain: "Shadow IT = unsanctioned tech (personal cloud, side accounts) that creates unmanaged risk.", explainSk: "Shadow IT sú neschválené technológie (súkromný cloud, vlastné účty), ktoré vytvárajú neriadené riziko." },
  { id: "q128", domain: 2, q: "Which is the BEST physical mitigation against tailgating into a data center?", options: ["Door locks","Access control vestibule (mantrap)","Security cameras","Lighting"], answer: 1, explain: "A mantrap admits only one person at a time, defeating tailgating directly.", explainSk: "Mantrap (bezpečnostná chodba) pustí naraz len jednu osobu — priamo bráni tailgatingu." },
  { id: "q129", domain: 2, q: "Which technique prevents an attacker from reusing valid session cookies they've stolen?", options: ["Setting cookie expiration far in the future","Using HttpOnly, Secure, SameSite cookies and short session timeouts","Using basic auth","Disabling logging"], answer: 1, explain: "Hardened cookie attributes plus short timeouts limit theft and abuse windows.", explainSk: "HttpOnly, Secure, SameSite a krátke timeouty obmedzia zneužitie ukradnutých session cookies." },
  { id: "q130", domain: 2, q: "An attacker sends spoofed emails appearing to be from the CFO, requesting an urgent wire transfer. This is:", options: ["Spear phishing / BEC","Whaling against the CFO","Pharming","Vishing"], answer: 0, explain: "Targeted email impersonating an executive to drive financial fraud is BEC (Business Email Compromise), often classed under spear phishing.", explainSk: "Cielený e-mail za výkonného na finančný podvod je BEC (Business Email Compromise), často pod spear phishing." },

  /* ===== DOMAIN 3 ===== */
  { id: "q201", domain: 3, q: "In an IaaS model, who is responsible for patching the guest operating system?", options: ["The cloud provider","The customer","Shared","Neither — it auto-patches"], answer: 1, explain: "In IaaS, the customer manages the OS, runtime, application, and data. The provider handles physical and hypervisor layers.", explainSk: "V IaaS zákazník spravuje OS, runtime, aplikáciu a dáta; poskytovateľ fyziku a hypervízor." },
  { id: "q202", domain: 3, q: "Which deployment model uses a mix of public and private cloud with orchestration?", options: ["Multicloud","Hybrid","Community","Edge"], answer: 1, explain: "Hybrid combines private + public with orchestration. Multicloud uses multiple public providers.", explainSk: "Hybrid spája súkromný a verejný cloud s orchestráciou. Multicloud znamená viacerých verejných poskytovateľov." },
  { id: "q203", domain: 3, q: "Which BEST describes microsegmentation?", options: ["VLANs separating departments","Per-workload network policy enforced by host firewalls or service mesh","Splitting backups across regions","Dedicated VLAN for guests"], answer: 1, explain: "Microsegmentation enforces fine-grained policy down to individual workloads, often with host firewalls or a service mesh.", explainSk: "Mikrosegmentácia uplatňuje jemnú sieťovú politiku na úroveň jednotlivých workloadov (host FW, service mesh)." },
  { id: "q204", domain: 3, q: "Which network appliance sits inline and can drop malicious traffic in real time?", options: ["IDS","Honeypot","IPS","NetFlow collector"], answer: 2, explain: "An IPS is inline and actively blocks; an IDS is passive and only alerts.", explainSk: "IPS sedí inline a vie blokovať; IDS je pasívne a len hlási." },
  { id: "q205", domain: 3, q: "Which is the strongest EAP method, requiring client-side certificates?", options: ["EAP-TTLS","PEAP","EAP-FAST","EAP-TLS"], answer: 3, explain: "EAP-TLS uses both server and client certificates, providing mutual authentication and the strongest assurance.", explainSk: "EAP-TLS vyžaduje certifikáty servera aj klienta — vzájomná autentifikácia a najsilnejšia úroveň istoty." },
  { id: "q206", domain: 3, q: "Which is the recommended Wi-Fi security standard for new deployments?", options: ["WEP","WPA","WPA2-PSK","WPA3"], answer: 3, explain: "WPA3 with SAE replaces the WPA2 4-way handshake and resists offline brute-force attacks.", explainSk: "WPA3 so SAE nahrádza WPA2 handshake a odoláva offline hrubým silám na heslo." },
  { id: "q207", domain: 3, q: "Which TLS port is standard for HTTPS?", options: ["443","465","8080","993"], answer: 0, explain: "HTTPS uses TCP/443. 465 is SMTPS, 993 is IMAPS.", explainSk: "HTTPS štandardne používa TCP/443. 465 je SMTPS, 993 IMAPS." },
  { id: "q208", domain: 3, q: "Which BEST describes a screened subnet (DMZ)?", options: ["Encrypted backup zone","Network segment that hosts public-facing services with restricted internal access","Out-of-band management network","An IPv6-only zone"], answer: 1, explain: "A DMZ hosts public-facing services and limits direct access to the internal trusted network.", explainSk: "DMZ ( screened subnet) hostí verejné služby a obmedzuje priamy prístup do dôveryhodnej vnútornej siete." },
  { id: "q209", domain: 3, q: "An organization wants near-real-time data and the fastest RTO during a regional outage. Which DR site is BEST?", options: ["Cold site","Warm site","Hot site","Mobile site"], answer: 2, explain: "A hot site is fully running with synchronized data; lowest RTO/RPO at highest cost.", explainSk: "Hot site je plne funkčný s aktuálnymi dátami — najnižší RTO/RPO, najvyššie náklady." },
  { id: "q210", domain: 3, q: "Which backup type takes only changes since the last full backup, requiring full + 1 differential to restore?", options: ["Incremental","Differential","Snapshot","Synthetic full"], answer: 1, explain: "Differential backups capture all changes since the last full backup. Restore = full + most recent differential.", explainSk: "Diferenciálny záloh zachytí zmeny od posledného plného; obnova = plná + posledný diferenciál." },
  { id: "q211", domain: 3, q: "Which BEST defends against ransomware destroying backups?", options: ["Daily full backups","Offline / air-gapped or immutable backups","Encrypted backups","Backups stored on the same SAN"], answer: 1, explain: "Offline/air-gapped or WORM/immutable backups can't be encrypted by ransomware reaching production storage.", explainSk: "Offline / air-gap alebo nemenné (immutable) zálohy ransomware nedokáže zašifrovať z produkčného účtu." },
  { id: "q212", domain: 3, q: "Which RAID level provides striping with parity and tolerates a single disk failure?", options: ["RAID 0","RAID 1","RAID 5","RAID 10"], answer: 2, explain: "RAID 5 stripes data with distributed parity, surviving a single disk failure.", explainSk: "RAID 5 stripuje dáta s distribuovanou paritou a znesie výpadok jedného disku." },
  { id: "q213", domain: 3, q: "Which is the BEST way to keep data in transit confidential?", options: ["Hashing","TLS / IPsec","FDE","Tokenization"], answer: 1, explain: "TLS or IPsec encrypts data in motion; FDE protects data at rest.", explainSk: "TLS alebo IPsec šifruje dáta pri prenose; FDE chráni dáta v pokoji." },
  { id: "q214", domain: 3, q: "Which describes data sovereignty?", options: ["Encryption used by the government","Data is governed by the laws of the jurisdiction it is stored in","Data ownership transferred to a vendor","Right to be forgotten"], answer: 1, explain: "Data sovereignty refers to data being subject to the laws of the country it resides in.", explainSk: "Suverenita dát znamená, že platia zákony jurisdikcie, kde sú dáta uložené." },
  { id: "q215", domain: 3, q: "What does an HSM PRIMARILY provide?", options: ["Antivirus signatures","Tamper-resistant key storage and crypto operations","Backup destination for VMs","Patch management"], answer: 1, explain: "HSMs are dedicated tamper-resistant hardware for storing keys and performing crypto operations.", explainSk: "HSM primárne poskytuje odolné úložisko kľúčov a kryptografické operácie v HW." },
  { id: "q216", domain: 3, q: "Which BEST defines a CASB?", options: ["A type of firewall","A broker enforcing security policies between users and cloud apps","A specialized backup product","A role-based authentication system"], answer: 1, explain: "CASBs sit between users and cloud apps, enforcing policy (visibility, compliance, threat protection, DLP).", explainSk: "CASB vynucuje politiku medzi používateľmi a cloudovými aplikáciami (viditeľnosť, compliance, hrozby, DLP)." },
  { id: "q217", domain: 3, q: "What is the PRIMARY benefit of SDN?", options: ["Eliminates the need for switches","Separates the control plane from the data plane for centralized policy","Replaces firewalls","Encrypts all packets"], answer: 1, explain: "SDN decouples decision-making from forwarding, enabling centralized, programmable policy.", explainSk: "SDN oddelí riadiacu rovinu od dátovej — centralizovaná programovateľná politika." },
  { id: "q218", domain: 3, q: "Which port is associated with SSH (and SFTP)?", options: ["22","23","53","443"], answer: 0, explain: "SSH (and SFTP, which runs over SSH) use TCP/22.", explainSk: "SSH a SFTP nad SSH používajú TCP/22." },
  { id: "q219", domain: 3, q: "Which BEST describes a forward proxy?", options: ["Fronts internal services for external users","Filters/caches user traffic going out to the internet","Encrypts backups","Distributes inbound load"], answer: 1, explain: "A forward proxy sits between internal users and the internet for filtering, caching, and policy.", explainSk: "Forward proxy medzi internými používateľmi a internetom filtruje, cachuje a uplatňuje politiku." },
  { id: "q220", domain: 3, q: "An organization wants to ensure all servers can survive a single AZ failure with minimal downtime. Which BEST helps?", options: ["Single hot spare","Multi-AZ deployment with auto-failover","Daily full backups","Cold standby in another region"], answer: 1, explain: "Multi-AZ active/active or active/passive with auto-failover provides HA across availability zones.", explainSk: "Multi-AZ s automatickým failoverom zvyčajne najlepšie zvládne výpadok jednej zóny dostupnosti." },
  { id: "q221", domain: 3, q: "Which BEST describes the difference between RTO and RPO?", options: ["RTO is for hardware; RPO is for software","RTO is downtime tolerated; RPO is data loss tolerated","RTO is regulatory; RPO is contractual","They are synonyms"], answer: 1, explain: "RTO = how long until restored. RPO = how much data loss is acceptable (drives backup frequency).", explainSk: "RTO = tolerovaný výpadok času. RPO = tolerovaná strata dát (frekvencia záloh)." },
  { id: "q222", domain: 3, q: "Which IPsec mode encrypts the original IP header by encapsulating the entire packet?", options: ["Transport","Tunnel","Aggressive","Quick"], answer: 1, explain: "Tunnel mode encrypts the entire original packet, including the IP header, and adds a new outer IP header.", explainSk: "Tunelový režim IPsec zašifruje celý pôvodný paket vrátane IP hlavičky a pridá novú vonkajšiu hlavičku." },
  { id: "q223", domain: 3, q: "Which is a BEST practice for protecting cloud admin accounts?", options: ["Reuse the same password across cloud and email","Disable MFA for emergencies","Enforce phishing-resistant MFA and least-privilege roles","Share root credentials with the team"], answer: 2, explain: "Cloud admins should have phishing-resistant MFA, individual accounts, least privilege, and just-in-time elevation.", explainSk: "Cloud admini: phishing-odolné MFA, individuálne účty, least privilege a JIT eskalácia." },
  { id: "q224", domain: 3, q: "Which is the PRIMARY purpose of a jump server / bastion host?", options: ["Caching web pages","Centralized, monitored access path to internal systems","DDoS protection","Backup server"], answer: 1, explain: "A bastion host is a hardened pivot point used for administrative access, with strong logging.", explainSk: "Jump/bastion server je centralizovaný, monitorovaný vstup na správu interných systémov." },
  { id: "q225", domain: 3, q: "Which device approach is BEST for limiting one MAC address per switch port?", options: ["802.1X","Port security","NAC","MAC filtering on the firewall"], answer: 1, explain: "Port security restricts the number/identity of MAC addresses allowed on a switch port.", explainSk: "Port security na prepínači obmedzuje počet/identitu MAC adries na porte." },
  { id: "q226", domain: 3, q: "Which configuration BEST supports protecting data in use?", options: ["Disk encryption","TLS for transit","Confidential computing / secure enclaves","RAID 5"], answer: 2, explain: "Confidential computing uses secure enclaves (SGX, TrustZone, AMD SEV) to keep data encrypted while being processed.", explainSk: "Dôverné výpočty (secure enclaves / confidential computing) chránia dáta aj počas spracovania." },

  /* ===== DOMAIN 4 ===== */
  { id: "q301", domain: 4, q: "Which is the FIRST step in NIST's incident response lifecycle?", options: ["Containment","Preparation","Eradication","Recovery"], answer: 1, explain: "Preparation comes first: plan, tools, training, contacts. You can't respond well to what you haven't prepared for.", explainSk: "Príprava je prvá: plán, nástroje, školenia, kontakty — bez nej sa nedá kvalitne reagovať." },
  { id: "q302", domain: 4, q: "Which order of volatility lists items from MOST to LEAST volatile?", options: ["Disk → RAM → CPU registers","CPU registers → RAM → Disk → Backups","Backups → RAM → Network state","RAM → CPU registers → Disk"], answer: 1, explain: "From most to least volatile: CPU registers/cache → RAM → network/process state → disk → backups/archives.", explainSk: "Od najvolatilnejšieho po najmenej: CPU registre/cache → RAM → stav siete/procesov → disk → zálohy/archívy." },
  { id: "q303", domain: 4, q: "Which document tracks who handled evidence, when, where, and why?", options: ["Incident report","Chain of custody","RCA","BIA"], answer: 1, explain: "Chain of custody is required for forensic evidence to be admissible and trustworthy.", explainSk: "Reťaz zodpovednosti (chain of custody) je potrebná na dôveryhodné a súdne použiteľné dôkazy." },
  { id: "q304", domain: 4, q: "Which BEST describes EDR vs. XDR?", options: ["No difference","EDR is for endpoints; XDR adds telemetry from network, email, cloud, and identity","XDR is for endpoints only","EDR replaces SIEM"], answer: 1, explain: "EDR focuses on endpoints; XDR correlates data across multiple security domains for broader detection.", explainSk: "EDR sa zameriava na endpointy; XDR koreluje telemetriu zo siete, e-mailu, cloudu a identity." },
  { id: "q305", domain: 4, q: "Which BEST defines a security baseline?", options: ["The cheapest possible configuration","The documented, approved secure configuration that systems must match","The minimum patch level","The default vendor settings"], answer: 1, explain: "A baseline is the formally approved secure configuration; deviations are 'drift.'", explainSk: "Baseline je formálne schválená bezpečná konfigurácia; odchýlky sú „drift“." },
  { id: "q306", domain: 4, q: "Which is the MOST appropriate tool to centrally collect and correlate security logs?", options: ["WAF","SIEM","HIDS","DLP"], answer: 1, explain: "A SIEM aggregates logs from many sources and applies correlation rules and analytics.", explainSk: "SIEM centralizuje logy z viacerých zdrojov a používa koreláciu a analytiku." },
  { id: "q307", domain: 4, q: "Which adds automation playbooks to security operations, e.g., auto-isolating hosts?", options: ["SOAR","SIEM","NAC","CASB"], answer: 0, explain: "SOAR (Security Orchestration, Automation, and Response) automates incident response actions.", explainSk: "SOAR automatizuje kroky reakcie na incidenty (orchestrácia a playbooky)." },
  { id: "q308", domain: 4, q: "Which is the BEST first step when a vulnerability scan reports a critical finding on an internet-facing host?", options: ["Verify the finding (false-positive check) and prioritize remediation","Reboot the server","Notify the press","Disable the scanner"], answer: 0, explain: "Validate to avoid wasted effort, then prioritize based on exposure, exploitability, and asset criticality.", explainSk: "Najprv over nález (falošné pozitíva), potom prioritizuj podľa expozície, zneužiteľnosti a kritickosti aktíva." },
  { id: "q309", domain: 4, q: "Which testing approach analyzes source code without executing it?", options: ["DAST","SAST","IAST","Fuzzing"], answer: 1, explain: "Static Application Security Testing analyzes source/bytecode without execution to find vulns early.", explainSk: "SAST analyzuje zdrojový alebo bajtkód bez spustenia — včasné hľadanie zraniteľností." },
  { id: "q310", domain: 4, q: "Which testing simulates an external attacker with no internal information?", options: ["White-box testing","Gray-box testing","Black-box testing","Insider testing"], answer: 2, explain: "Black-box (unknown environment) testing simulates an external attacker with no insider knowledge.", explainSk: "Black-box test simuluje externého útočníka bez interných informácií." },
  { id: "q311", domain: 4, q: "Which scoring system rates vulnerabilities from 0.0 to 10.0?", options: ["CVE","CVSS","CWE","NIST CSF"], answer: 1, explain: "CVSS scores severity; CVE is the unique identifier for the vulnerability.", explainSk: "CVSS hodnotí závažnosť 0,0–10,0; CVE je jedinečný identifikátor zraniteľnosti." },
  { id: "q312", domain: 4, q: "Which is the MOST appropriate response when remediation isn't feasible and risk has been accepted?", options: ["Document a formal exception with owner and review date","Ignore the finding","Apply the patch anyway","Disable scanning"], answer: 0, explain: "Risk acceptance must be documented with the owner, justification, compensating controls, and a review date.", explainSk: "Akceptované riziko musí byť zdokumentované s vlastníkom, zdôvodnením, kompenzačnými kontrolami a dátom revízie." },
  { id: "q313", domain: 4, q: "Which BEST defines threat hunting?", options: ["Reactive triage of SIEM alerts","Proactive search for unknown compromise based on hypotheses","Vendor-supplied threat intel feeds","Annual penetration test"], answer: 1, explain: "Threat hunting proactively searches for adversaries that haven't tripped alerts, often guided by TTPs (MITRE ATT&CK).", explainSk: "Threat hunting aktívne hľadá kompromitáciu, ktorá ešte nespustila alerty, často podľa TTP (MITRE ATT&CK)." },
  { id: "q314", domain: 4, q: "Which IAM control issues short-lived elevated privileges only when needed?", options: ["RBAC","Just-in-Time (JIT) access","ABAC","ACLs"], answer: 1, explain: "JIT access grants elevated rights for a short window then revokes them, reducing standing privilege.", explainSk: "JIT prístup udelí vyvýšené práva len na krátky čas a potom ich odoberie — menej stálych privilegií." },
  { id: "q315", domain: 4, q: "Which method is MOST resistant to password phishing?", options: ["TOTP from an authenticator app","Push notification","FIDO2 / passkey","SMS code"], answer: 2, explain: "FIDO2/WebAuthn binds the credential to the legitimate site origin, defeating credential phishing.", explainSk: "FIDO2/WebAuthn viaže poverenie na legitímny pôvod stránky a odoláva phishingu hesiel." },
  { id: "q316", domain: 4, q: "Which is BEST for tracking software components in your apps for vulnerability management?", options: ["WAF logs","SBOM","CRL","DLP policy"], answer: 1, explain: "An SBOM (Software Bill of Materials) inventories components and versions used so you can map advisories to your apps.", explainSk: "SBOM inventarizuje komponenty a verzie aplikácie na mapovanie bezpečnostných oznámení." },
  { id: "q317", domain: 4, q: "Which BEST describes federation in IAM?", options: ["A single sign-on portal within one company","Trust relationship across separate identity domains","Replacing all passwords with biometrics","Only used in cloud"], answer: 1, explain: "Federation enables identities from one domain to access resources in another via standards like SAML/OIDC.", explainSk: "Federácia umožní identitám z jednej domény prístup k zdrojom v inej (SAML, OIDC)." },
  { id: "q318", domain: 4, q: "Which standard is XML-based and commonly used for SaaS SSO?", options: ["OAuth 2.0","OpenID Connect","SAML 2.0","Kerberos"], answer: 2, explain: "SAML 2.0 is XML-based and widely used for enterprise SaaS SSO.", explainSk: "SAML 2.0 je XML a bežne sa používa na enterprise SSO do SaaS." },
  { id: "q319", domain: 4, q: "Which password practice does modern guidance (NIST 800-63B) discourage?", options: ["Length over complexity","Blocking known-breached passwords","Forced periodic expiration without cause","Allowing long passphrases"], answer: 2, explain: "NIST recommends against routine forced expiration; rotate only on suspicion of compromise.", explainSk: "NIST neodporúča rutinnú periodickú výmenu hesla; meniť pri podozrení na kompromitáciu." },
  { id: "q320", domain: 4, q: "Which is the PRIMARY purpose of a CASB?", options: ["Encrypt backups","Enforce policy and provide visibility for cloud app usage","Block all SaaS","Replace MFA"], answer: 1, explain: "CASBs provide visibility, compliance, threat protection, and DLP for cloud applications.", explainSk: "CASB poskytuje viditeľnosť, compliance, ochranu pred hrozbami a DLP pre cloudové aplikácie." },
  { id: "q321", domain: 4, q: "Which is the strongest physical evidence handling step?", options: ["Photograph everything","Use a write-blocker to image storage","Restart the system","Delete everything quickly"], answer: 1, explain: "A write-blocker prevents accidental modification of source media during forensic imaging.", explainSk: "Write-blocker zabráni náhodnej zmene zdrojového média pri forenznom imagingu." },
  { id: "q322", domain: 4, q: "Which is the MOST common cause of cloud data breaches?", options: ["Zero-day OS exploits","Misconfiguration","Hypervisor escape","Insider sabotage"], answer: 1, explain: "Misconfiguration (open buckets, lax IAM, exposed services) drives the majority of cloud incidents.", explainSk: "Chybná konfigurácia (verejné bucket-y, slabé IAM, expozície služieb) spôsobuje väčšinu cloud incidentov." },
  { id: "q323", domain: 4, q: "Which is BEST for limiting USB-borne malware on endpoints?", options: ["Allow all USB","Disable USB or use endpoint policy to allow only approved devices","Use guest accounts","Antivirus updates"], answer: 1, explain: "Endpoint policies that disable or whitelist USB devices defeat unauthorized USB-borne malware.", explainSk: "Politika endpointu na USB (vypnutie alebo whitelist) bráni malwaru z nepovolených zariadení." },
  { id: "q324", domain: 4, q: "Which email control involves the sender publishing allowed sending IPs in DNS?", options: ["DKIM","SPF","DMARC","BIMI"], answer: 1, explain: "SPF lists authorized sender IPs in DNS so receivers can validate the source.", explainSk: "SPF v DNS zverejní povolené IP odosielateľov pre overenie zdroja." },
  { id: "q325", domain: 4, q: "Which email standard combines SPF + DKIM with policy and reporting?", options: ["DMARC","S/MIME","DNSSEC","STARTTLS"], answer: 0, explain: "DMARC publishes a policy (none/quarantine/reject) and reporting addresses, building on SPF and DKIM.", explainSk: "DMARC zverejní politiku (none/quarantine/reject) a reporting, stavia na SPF a DKIM." },
  { id: "q326", domain: 4, q: "Which IAM model assigns access based on attributes like department, location, and time?", options: ["DAC","MAC","RBAC","ABAC"], answer: 3, explain: "ABAC evaluates attributes about the user, resource, and context to make decisions.", explainSk: "ABAC rozhoduje podľa atribútov používateľa, zdroja a kontextu." },
  { id: "q327", domain: 4, q: "Which is the BEST way to monitor and prevent sensitive data leaving the organization?", options: ["DLP","EDR","WAF","NAC"], answer: 0, explain: "DLP policies inspect outbound channels (email, web, USB, cloud) for sensitive data per policy.", explainSk: "DLP kontroluje odchádzajúce kanály (e-mail, web, USB, cloud) na únik citlivých dát." },
  { id: "q328", domain: 4, q: "Which is the BEST control for detecting changes to critical system files?", options: ["FIM (file integrity monitoring)","NetFlow","CASB","SOAR"], answer: 0, explain: "FIM tools (Tripwire, OSSEC) hash critical files and alert on unexpected changes.", explainSk: "FIM sleduje zmeny kritických súborov (hash, upozornenia pri nečakaných zmenách)." },
  { id: "q329", domain: 4, q: "Which BEST describes the purpose of a change advisory board (CAB)?", options: ["Approves and reviews changes by risk and impact","Performs penetration tests","Owns the BCP","Replaces the security team"], answer: 0, explain: "A CAB reviews and approves proposed changes, weighing risk, business impact, and timing.", explainSk: "CAB schvaľuje a posudzuje zmeny z hľadiska rizika, dopadu a načasovania." },
  { id: "q330", domain: 4, q: "Which BEST describes 'Living off the Land' (LotL) techniques?", options: ["Using rare, custom malware","Using built-in OS tools (PowerShell, WMI) for malicious purposes","Operating on offline systems","Adversary-in-the-middle"], answer: 1, explain: "LotL uses legitimate, signed system utilities to evade signature-based defenses.", explainSk: "LotL zneužíva legitímne nástroje OS na obchádzanie signatúrových obrán." },
  { id: "q331", domain: 4, q: "Which is the BEST method to detect known-bad domains and block resolution?", options: ["DNS filtering","Hashing","SAST","FIM"], answer: 0, explain: "DNS filtering (e.g., Umbrella) blocks resolution of known-bad domains, defeating many phishing and C2 attempts.", explainSk: "DNS filtering blokuje rozlíšenie známych škodlivých domén (phishing, C2)." },
  { id: "q332", domain: 4, q: "Which is the LAST phase of NIST IR lifecycle?", options: ["Recovery","Eradication","Lessons learned","Containment"], answer: 2, explain: "Lessons learned (post-incident) is the final phase, feeding improvements back into preparation.", explainSk: "Záverečná fáza NIST IR sú ponaučenia (lessons learned), ktoré posilnia prípravu." },

  /* ===== DOMAIN 5 ===== */
  { id: "q401", domain: 5, q: "Which document is HIGH-LEVEL and authorizes the security program?", options: ["Procedure","Standard","Policy","Guideline"], answer: 2, explain: "Policies are high-level, authoritative, and approved by leadership. Standards/procedures derive from them.", explainSk: "Politiky sú vysokoúrovňové, schválené vedením; štandardy a postupy z nich vychádzajú." },
  { id: "q402", domain: 5, q: "Which calculation is SLE × ARO?", options: ["Risk score","ALE","CVSS","RTO"], answer: 1, explain: "Annualized Loss Expectancy = Single Loss Expectancy × Annualized Rate of Occurrence.", explainSk: "ALE = SLE × ARO (ročná očakávaná strata = jednotková strata × ročná frekvencia výskytu)." },
  { id: "q403", domain: 5, q: "Which risk treatment passes risk to a third party (e.g., insurance)?", options: ["Mitigate","Transfer","Accept","Avoid"], answer: 1, explain: "Risk transference moves financial responsibility to another party, often via insurance or outsourcing.", explainSk: "Transfer rizika presunie finančnú zodpovednosť inam, často poistením alebo outsourcingom." },
  { id: "q404", domain: 5, q: "Which agreement defines specific deliverables under an existing master contract?", options: ["MSA","SOW","NDA","BPA"], answer: 1, explain: "A Statement of Work specifies deliverables, timeline, and acceptance criteria within a Master Service Agreement.", explainSk: "SOW špecifikuje dodávky, časový plán a kritériá akceptácie v rámci MSA." },
  { id: "q405", domain: 5, q: "Which agreement defines the performance metrics and penalties of a service?", options: ["NDA","MOU","SLA","SOW"], answer: 2, explain: "SLAs (Service Level Agreements) state performance commitments and remedies.", explainSk: "SLA stanovuje metriky výkonu služby a nápravné opatrenia." },
  { id: "q406", domain: 5, q: "Which European regulation governs personal data protection broadly?", options: ["HIPAA","SOX","GDPR","PCI DSS"], answer: 2, explain: "The General Data Protection Regulation governs personal data of EU residents.", explainSk: "GDPR upravuje ochranu osobných údajov obyvateľov EÚ." },
  { id: "q407", domain: 5, q: "Which framework's Functions include Identify, Protect, Detect, Respond, Recover (and Govern in 2.0)?", options: ["ISO 27001","NIST CSF","COBIT","ITIL"], answer: 1, explain: "The NIST Cybersecurity Framework organizes outcomes into these core Functions.", explainSk: "NIST CSF organizuje výstupy do funkcií Identify, Protect, Detect, Respond, Recover (v 2.0 aj Govern)." },
  { id: "q408", domain: 5, q: "Which audit report type covers operating effectiveness over a period?", options: ["SOC 1 Type I","SOC 2 Type I","SOC 2 Type II","SOC 3"], answer: 2, explain: "SOC 2 Type II evaluates control effectiveness across a period (typically 6–12 months).", explainSk: "SOC 2 Type II hodnotí účinnosť kontrol počas obdobia (typicky 6–12 mesiacov)." },
  { id: "q409", domain: 5, q: "Which is the BEST description of a BIA?", options: ["A penetration test report","An analysis identifying critical business functions and impact of disruption","A vendor risk questionnaire","A security awareness program"], answer: 1, explain: "A Business Impact Analysis identifies critical processes, dependencies, and the impact of disruption (RTO/RPO inputs).", explainSk: "BIA identifikuje kritické procesy, závislosti a dopad prerušenia (vstupy pre RTO/RPO)." },
  { id: "q410", domain: 5, q: "Which role under GDPR oversees privacy compliance and is required for many organizations?", options: ["Data subject","Data steward","DPO (Data Protection Officer)","CISO"], answer: 2, explain: "The DPO is responsible for privacy compliance and is mandatory for certain processing activities under GDPR.", explainSk: "DPO dohliada na súlad s ochranou osobných údajov; pri určitých spracovaniach je povinný." },
  { id: "q411", domain: 5, q: "Which BEST describes a tabletop exercise?", options: ["Live failover to DR site","Discussion-based walkthrough of an incident scenario","Vulnerability scan","Code review"], answer: 1, explain: "Tabletops are facilitated discussions that test plans without touching production systems.", explainSk: "Tabletop je diskusná prechádzka scenárom bez zásahu do produkčných systémov." },
  { id: "q412", domain: 5, q: "Which is the FIRST step in vendor due diligence?", options: ["Sign the contract","Issue a security questionnaire and review independent assessments","Begin a pen test","Pay invoice"], answer: 1, explain: "Due diligence starts with collecting evidence: questionnaires (SIG/CAIQ), SOC 2 / ISO 27001 reports, references.", explainSk: "Due diligence začína zberom dôkazov: dotazníky, SOC 2 / ISO 27001, referencie." },
  { id: "q413", domain: 5, q: "Which clause in a vendor contract permits the customer to audit the vendor?", options: ["Right-to-audit","Indemnification","Non-compete","Force majeure"], answer: 0, explain: "A right-to-audit clause is essential for verifying vendor security claims.", explainSk: "Doložka práva na audit umožní overiť tvrdenia dodávateľa o bezpečnosti." },
  { id: "q414", domain: 5, q: "Which document captures risks, owners, likelihood, impact, and mitigation status?", options: ["Risk register","BIA","SLA","SOW"], answer: 0, explain: "A risk register is the central tracking document for identified risks.", explainSk: "Register rizík centralizuje identifikované riziká, vlastníkov a stav mitigácie." },
  { id: "q415", domain: 5, q: "Which BEST describes risk appetite?", options: ["Maximum risk score allowed by law","Amount and type of risk leadership is willing to pursue","Annualized loss in dollars","A control's effectiveness"], answer: 1, explain: "Risk appetite is the level of risk an organization is willing to accept to achieve its objectives.", explainSk: "Risk appetite je úroveň rizika, ktorú organizácia vedenie ochotne prijme pri dosahovaní cieľov." },
  { id: "q416", domain: 5, q: "Which BEST describes the difference between an MOU and a contract?", options: ["MOUs are legally binding; contracts are not","MOUs express intent and are typically NOT legally enforceable; contracts are","They are identical","MOUs require government approval"], answer: 1, explain: "MOUs are typically expressions of intent and not strictly enforceable; contracts (MSA/SOW) are.", explainSk: "MOU vyjadruje zámer a zvyčajne nie je právne vymáhateľný; zmluvy (MSA/SOW) sú." },
  { id: "q417", domain: 5, q: "Which is the BEST sanitization method for highest sensitivity drives that must never be reused?", options: ["Quick format","Overwrite","Cryptographic erase","Physical destruction (shred/incinerate)"], answer: 3, explain: "Destruction (shredding, incineration, pulverization) is required for the most sensitive media.", explainSk: "Pri najcitlivejších médiách, ktoré sa nesmú znova použiť, treba fyzickú deštrukciu (sekanie, spaľovanie)." },
  { id: "q418", domain: 5, q: "Which is the PRIMARY purpose of an Acceptable Use Policy?", options: ["Enforce technical controls","Define acceptable behavior with company resources","Set encryption standards","Define backup retention"], answer: 1, explain: "An AUP communicates rules and expectations for using company resources.", explainSk: "AUP stanovuje pravidlá a očakávania pri používaní firemných zdrojov." },
  { id: "q419", domain: 5, q: "Which is the BEST metric for the average time to restore service after an incident?", options: ["MTBF","MTTR","RTO","RPO"], answer: 1, explain: "Mean Time To Repair (or Recover) measures the average restoration time. RTO is the *target*, MTTR is the *measured average*.", explainSk: "MTTR meria priemerný čas obnovy; RTO je cieľ, MTTR je meraný priemer." },
  { id: "q420", domain: 5, q: "Which agreement is signed before sharing confidential information with a third party?", options: ["NDA","SLA","SOW","BPA"], answer: 0, explain: "An NDA legally protects shared confidential information.", explainSk: "NDA chráni zdieľané dôverné informácie pred zverejnením tretím stranám." },
  { id: "q421", domain: 5, q: "Which BEST describes ISO/IEC 27001?", options: ["A US federal regulation","An international standard for an Information Security Management System","A penetration testing methodology","A privacy law"], answer: 1, explain: "ISO 27001 is the international standard for ISMS, supported by ISO 27002 control guidance.", explainSk: "ISO 27001 je medzinárodný štandard pre ISMS; ISO 27002 dáva usmernenie kontrol." },
  { id: "q422", domain: 5, q: "Which is the BEST first action when a critical vendor is breached?", options: ["Cancel the contract","Activate vendor incident response — assess scope, exposure, and required customer actions","Ignore until news subsides","Increase invoice payments"], answer: 1, explain: "Activate the vendor IR clause — get facts, scope of exposure, customer impact, required actions.", explainSk: "Spusti IR s dodávateľom — rozsah, expozícia, dopad na zákazníka, potrebné kroky." },
  { id: "q423", domain: 5, q: "Which is the PRIMARY purpose of security awareness training?", options: ["Eliminate the need for security tools","Reduce human-error and social-engineering risk","Replace MFA","Lower insurance premiums (only)"], answer: 1, explain: "Awareness reduces the human attack surface — the most exploited target in modern breaches.", explainSk: "Povedomie znižuje ľudský útočný povrch — často najzraniteľnejší prvok." },
  { id: "q424", domain: 5, q: "Which is BEST described as a KRI?", options: ["A technical control","An early-warning indicator that a risk is increasing","An audit finding","A regulatory penalty"], answer: 1, explain: "Key Risk Indicators are forward-looking metrics that warn when a risk is trending upward.", explainSk: "KRI sú prediktívne metriky varujúce, že riziko rastie." },
  { id: "q425", domain: 5, q: "Which is the BEST way to verify a data destruction service was performed?", options: ["Trust the vendor","Obtain a Certificate of Destruction with serials and dates","Check the news","Call the vendor monthly"], answer: 1, explain: "Certificates of Destruction provide auditable proof, often with serial numbers and method.", explainSk: "Certifikát deštrukcie poskytuje auditovateľný dôkaz so sériovými číslami a metódou." },
  { id: "q426", domain: 5, q: "Which compliance impact comes from publicly disclosed major breaches?", options: ["No effect","Reputational damage and possible loss of customers / partners","Always increased market share","Reduced regulatory scrutiny"], answer: 1, explain: "Reputational damage and loss of customer trust are common consequences of public breach disclosures.", explainSk: "Verejné úniky často poškodia reputáciu a dôveru zákazníkov a partnerov." },
  { id: "q427", domain: 5, q: "Which assessment type measures controls AGAINST a defined standard or framework?", options: ["Penetration test","Compliance audit","Threat hunt","Vulnerability scan"], answer: 1, explain: "Compliance audits formally evaluate controls against a defined framework or regulation.", explainSk: "Compliance audit formálne porovná kontroly s definovaným rámcom alebo predpisom." },
  { id: "q428", domain: 5, q: "Which BEST helps reduce PCI DSS scope?", options: ["Encrypting backups","Network segmentation isolating cardholder data","Adding more applications to the cardholder environment","Storing more data"], answer: 1, explain: "Segmentation limits the systems in scope, reducing PCI assessment burden and risk.", explainSk: "Segmentácia siete obmedzí systémy v rozsahu PCI a zníži náklad na posúdenie aj riziko." }
];

/* Convenience exports */
window.SY701 = { DOMAINS, CHAPTERS, QUESTIONS };
