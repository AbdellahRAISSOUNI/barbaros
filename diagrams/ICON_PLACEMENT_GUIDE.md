# 🎨 Icon Placement Guide for Master Diagrams

This guide tells you exactly which icons to search for and where to place them to achieve that "Senior Architect" look.

## 1. MASTER-Architecture.drawio (The Tech Stack)

**Goal:** Highlight specific technologies. Use colored logos here.

| Location (Container/Shape) | Icon to Search For | Placement |
|---------------------------|-------------------|-----------|
| **CI/CD Pipeline** (Header) | `GitHub` (Octocat) | Top-left of the gray container |
| **GitHub Actions** (Box) | `GitHub Actions` or `Play Button` | Inside the box, left of text |
| **Production Cloud** (Header) | `Vercel` (Triangle logo) | Top-center of the main cloud zone |
| **Edge Network** (Box) | `Cloudflare` or `Globe` | Top-right of the dashed box |
| **WAF & DDoS** (Hexagon) | `Shield` or `Lock` | Centered inside the hexagon |
| **Static Asset Cache** (Hexagon) | `Fast` or `Lightning` | Centered inside the hexagon |
| **Serverless Compute** (Box) | `Next.js` (N logo) or `Node.js` | Background watermark or top-right |
| **Auth Service** (Box) | `Key` or `ID Card` | Left side of the box |
| **MongoDB Cluster** (Box) | `MongoDB` (Green Leaf) | Large icon in center of cluster box |
| **Object Storage** (Cloud) | `AWS S3` (Bucket) | Inside the cloud shape |

## 2. MASTER-DataFlow.drawio (The Logic)

**Goal:** Distinguish between types of data and processes. Use flat/monochrome icons.

| Location (Zone/Shape) | Icon to Search For | Placement |
|----------------------|-------------------|-----------|
| **User Domain** (Group) | `Users` or `Avatar Group` | Top-left of the red group |
| **Client Entity** | `Mobile User` | Inside entity box |
| **Barber Entity** | `Scissors` or `User Tie` | Inside entity box |
| **Business Domain** (Group) | `Briefcase` or `Building` | Top-left of blue group |
| **Visit Transaction** | `Receipt` or `Bill` | Inside entity box |
| **QR Scan Event** (Hexagon) | `QR Code` | Centered inside hexagon |
| **Verify Identity** (Diamond) | `Fingerprint` or `Checkmark` | Centered inside diamond |
| **Persist Visit** (Box) | `Database` (Cylinder) | Left side of box |
| **Unlock Reward** (Box) | `Gift` or `Trophy` | Right side of box |

## 3. MASTER-UserInteraction.drawio (The UX)

**Goal:** Visualize the human steps. Use emotive/action icons.

| Location (Swimlane/Step) | Icon to Search For | Placement |
|-------------------------|-------------------|-----------|
| **Client Experience** (Header) | `Smartphone` | Next to the title |
| **Landing Page** (Circle) | `Browser` or `Layout` | Centered in circle |
| **Registration** (Circle) | `Form` or `Pen` | Centered in circle |
| **QR Identity** (Circle) | `QR Code` (Large) | Centered in circle |
| **Visit Shop** (Circle) | `Store` or `Pin` | Centered in circle |
| **Barber Workflow** (Header) | `Scissors` | Next to title |
| **Scan QR** (Circle) | `Camera` or `Barcode Scanner` | Centered in circle |
| **Admin Workflow** (Header) | `Dashboard` or `Chart` | Next to title |
| **Analytics** (Hexagon) | `Bar Chart` or `Trend Up` | Centered in hexagon |

---

### 💡 Pro Tips for LucidChart/Draw.io:

1.  **Watermarks:** For large zones (like "Cloud Infrastructure"), place a large, light-grey version of the logo (e.g., Vercel triangle) behind all the other shapes.
2.  **Connection Icons:** You can place small lock icons 🔒 on top of lines connecting to the Database to signify "Encrypted/Secure Connection".
3.  **Replace Standard Shapes:** Instead of a standard cylinder for MongoDB, search for "MongoDB" in the library and use their official cylinder icon if available.

