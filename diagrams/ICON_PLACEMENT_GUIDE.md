# 🎨 Icon Placement & Styling Guide for Master Diagrams

This guide ensures your diagrams look like high-end engineering documentation.

**Current Master Diagrams:** 2 (Architecture + DataFlow)

---

## 1. MASTER-Architecture.drawio (The DevOps Blueprint)
**Theme:** "Infrastructure & Technology"
**Style:** Use **Official Brand Logos** (colored) for technologies to make them instantly recognizable.

| Zone / Container | Target Shape | Icon to Search For | Placement |
|------------------|--------------|--------------------|-----------|
| **CI/CD Pipeline** | `zone-cicd` (Gray Box) | **GitHub (Octocat)** | Top-left corner of the zone |
| **Pipeline Steps** | `ci-pipeline` | **GitHub Actions** (Blue play button) | Next to "GitHub Actions Pipeline" title |
| **Production Cloud** | `zone-cloud` | **Vercel** (Black Triangle) | Large, 10% opacity watermark in center |
| **Edge Layer** | `layer-edge` | **Cloudflare** (Cloud) or **Globe** | Top-right of the edge layer box |
| **WAF Node** | `node-waf` (Hexagon) | **Shield** or **Lock** (Red/White) | Center of hexagon |
| **CDN Node** | `node-cdn` (Hexagon) | **Lightning Bolt** (Yellow/Blue) | Center of hexagon |
| **Compute Layer** | `layer-compute` | **Next.js** (N logo) | Top-right of compute layer box |
| **Auth Service** | `svc-auth` | **Key** or **Padlock** | Left side of service box |
| **Data Layer** | `zone-data` | **MongoDB** (Green Leaf) | Large icon near "MongoDB Atlas" text |
| **Object Storage** | `s3` (Cloud Shape) | **AWS S3** (Bucket) | Center of cloud shape |

---

## 2. MASTER-DataFlow.drawio (The Logic Engine)
**Theme:** "Entities & Processes"
**Style:** Use **Flat/Monochrome Icons** (Gray/Black/White) to keep the focus on the logic structure.

| Zone / Domain | Target Shape | Icon to Search For | Placement |
|---------------|--------------|--------------------|-----------|
| **User Domain** | `dom-user` (Red Box) | **Users Group** (Silhouette) | Top-left header area |
| **Client Entity** | `ent-client` | **Mobile Phone** or **Person** | Inside box, left of text |
| **Barber Entity** | `ent-barber` | **Scissors** or **User Tie** | Inside box, left of text |
| **Business Domain**| `dom-biz` (Blue Box) | **Briefcase** | Top-left header area |
| **Visit Txn** | `ent-visit` | **Receipt** or **Document** | Inside box, left of text |
| **QR Event** | `node-scan` (Hexagon)| **QR Code** (Black) | Center of hexagon |
| **Verify Node** | `node-verify` (Diamond)| **Fingerprint** or **Checkmark** | Center of diamond |
| **Persist Node** | `node-persist` | **Database** (Cylinder) | Left side of box |
| **Reward Node** | `node-unlock` | **Gift Box** or **Trophy** | Right side of box |

---

### 🎨 Pro Styling Tips

1.  **Watermarks:**
    *   For the "Production Cloud" zone, place a massive Vercel logo.
    *   Set its **Opacity to 10%**.
    *   Send it to the **Back** (Right click -> Send to Back).
    *   This gives a professional "Architectural Blueprint" feel.

2.  **Connector Icons:**
    *   On the line connecting the API Cluster to MongoDB, place a tiny **Lock Icon** 🔒 to signify "TLS/SSL Encrypted Connection".
    *   On the line from CDN to S3, place a tiny **Clock Icon** 🕒 to signify "Cache Strategy".

3.  **Consistency:**
    *   Ensure all icons in `MASTER-DataFlow` are the same color (e.g., dark gray #444444).
    *   Ensure all icons in `MASTER-Architecture` are their official brand colors (Next.js Black, MongoDB Green, etc.).
