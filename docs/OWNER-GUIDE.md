# Owner guide: Ngina Trails and Safaris website and back office

This guide is for running the business, not for developers. You will not need to type any commands.

- **Your website** is at your domain (for example `https://nginatrails.com`).
- **Your back office** is at the same address followed by `/admin` (for example `https://nginatrails.com/admin`). Log in with your email and password.

> **Status.** Areas marked *(next update)* are designed and planned but arrive in the next delivery. Everything else works today, once the database is connected (section 4A).

---

## 1. What each area of the back office does

The left-hand menu is grouped and numbered. At the top is **Workspace**: the views you will use every day.

### Workspace

| Area | What it is for |
| --- | --- |
| **Overview** | Your day at a glance: tasks due, new leads, guests waiting for a reply, departures in the next 30 days and money received this month. Everything links to the record. |
| **Inbox** *(next update)* | Every email and live-chat conversation with guests, one thread per person. Assign to a colleague, mark as waiting / closed, write internal notes the guest never sees, and insert saved replies. Unread counts update live. |
| **Leads pipeline** | Every enquiry as a card, in columns: New → Contacted → Quoted → Deposit paid → Confirmed → Travelled → Review requested (and Lost). Use the arrows to move a lead along. Each card shows where it came from: the channel (form, plan-your-trip, chat), the button that was clicked and any campaign tag. Switch to **List** to see it as a table. |
| **Departures** | A month calendar of bookings (teal) and scheduled departures (ochre). |
| **Go-live setup** | Shows which services are connected and which content still needs your attention (admins only). |

### 01 Sales

| Area | What it is for |
| --- | --- |
| **Leads** | The full detail of each enquiry: dates, travellers, budget, the guest's message and the source. Leads are created automatically from the website. |
| **Contacts** | Everyone who has been in touch. Open a contact and choose the **Timeline** tab to see every email, chat, quote, booking and payment for that person. |
| **Companies** | Travel agents, partners and corporate clients. |
| **Conversations** | The raw list of email/chat threads (the Inbox is the friendlier view). |
| **Tasks** | Reminders for you or a colleague. Overdue tasks show on the Overview. |
| **Saved replies** | Reusable answers for the inbox. `{firstName}` and `{agentName}` are filled in for you. |
| **Review requests** | After every trip, each guest is asked for a review the same way, with one reminder. See section 3. |

### 02 Operations

| Area | What it is for |
| --- | --- |
| **Quotes** | Build a quote from one of your journeys: pick the journey and save, and the day-by-day plan and starting prices fill in. Adjust lines, discount and deposit %. Then press **Send to guest** (see section 2A). **Copy guest link** / **Open guest page** show exactly what the guest sees. |
| **Bookings** | Confirmed trips: dates, travellers, total, deposit, balance and the suppliers used. The amount paid and balance update automatically from payments. Buttons at the top: **Request deposit / balance** (emails the guest a pay link), **Request in KES (M-Pesa)** (for US$ bookings: enter today's rate and the guest gets an M-Pesa or card link in shillings), **Send confirmation** and **Copy trip page link**. |
| **Travellers** | The people on each booking. Only collect what the trip needs. |
| **Departures** | Scheduled trips with their guide and vehicle. |
| **Suppliers** | Lodges, camps, drivers, guides, boats and vehicles, with rates and licence notes. |

### 03 Money

| Area | What it is for |
| --- | --- |
| **Payments** | Every deposit and balance payment. Paystack payments (M-Pesa or card) are recorded automatically, and a receipt is emailed to the guest. Record bank transfers or cash as "manual". Tick **Reconciled** once you have matched a payment to your bank or Paystack statement. If a guest pays in KES for a US$ booking, enter the exchange rate and the booking is credited correctly. If a Paystack payment still shows "Waiting for guest", press **Check with Paystack**. |

### 04 Website

| Area | What it is for |
| --- | --- |
| **Home page** | The big statements, chapter texts, photos and the when-to-go strip. The **Featured journeys** tab sets the title and short intro above the sideways row of journeys. |
| **Journeys** | Safaris, coastal tours and walking trips: price from, days, best months, day-by-day plan, inclusions, Q&A and search settings. Tick **Featured** to show one on the home page. |
| **Destinations** | One page per place, with key facts (distance from Diani, altitude, area) and Q&A. Keep these accurate: Google and AI assistants quote them. |
| **Blog** | Articles at `/blog`. Give each one a photo, one or more topics (they become the filter buttons on the blog page) and clear headings: every heading appears in the article's "In this article" list. Related articles are picked automatically from shared topics. Old `/journal` links forward to the blog. |
| **Experiences, Wildlife guide, Guides & authors, Pages** | The rest of the site. Pages covers Our story, When to go, Privacy, Terms and Cookies. |
| **Photos & videos** | Upload your own pictures. Always fill in the description (alt text). Use the focal point to choose which part of the photo stays visible on phones. |

**Sample content.** Everything the setup created has a **Sample** tick box. Replace the text, photos and prices with your own and untick it. When you are done, turn off the "sample content" banner in **Business settings → Notifications**.

**Drafts.** Pages, journeys, destinations and articles can be saved as drafts; only **Publish** makes them visible. Publishing refreshes the website within seconds and notifies search engines.

### 05 Team

| Area | What it is for |
| --- | --- |
| **Team** | Who can log in. **Admin**: everything. **Sales agent**: leads, inbox, quotes, bookings, payments. **Content editor**: website content only. Untick **Active** to block someone without deleting their history. |
| **Audit log** | Who changed what and when (admins only, cannot be edited). |
| **Business settings** | Your contact details, address, opening hours, licences & memberships, review links and notification emails. |

---

## 2. How website enquiries reach you

Every button on the website that invites a guest to get in touch (the enquiry form, "Plan this journey", plan-your-trip and live chat) does the same things:

1. Finds the guest in **Contacts** by email, or creates them.
2. Creates a **Lead** in the pipeline, recording which page, button and campaign brought them.
3. Assigns it to the sales agent with the fewest open leads (or the guest's existing agent).
4. Puts the message in the **Inbox** so you can reply from there.
5. Emails the guest a thank-you; their reply comes back into the same conversation.
6. Emails the assigned agent.

Spam is blocked quietly with a hidden trap field, a timing check, a limit of 5 enquiries per 10 minutes per connection and, optionally, Cloudflare Turnstile.

## 2A. From quote to trip: what the guest sees

1. **You send the quote.** In **Quotes**, press **Send to guest**. The guest gets an email with a private link to their trip plan: day by day, what is included, the price, deposit and balance. They can save it as a PDF or print it. When they open it, the quote shows as **Viewed**.
2. **The guest accepts online.** They type their name, tick that they agree to your booking terms and press **Accept and book**. A **Booking** is created automatically (awaiting deposit), the lead moves along the pipeline, the guest gets a confirmation email and the team is emailed. If they press **No thanks**, the quote shows as **Declined** with their reason.
3. **The guest pays the deposit** from their private **My trip** page, by card (US$) or by M-Pesa or card (KES bookings, or a KES link you send). Payments are checked with Paystack before they are recorded; the booking updates and a receipt is emailed automatically.
4. **Every morning** the website does the routine work for you (needs `CRON_SECRET`, see section 4):
   - quotes past their "valid until" date become **Expired** (send again to give the guest 14 more days);
   - **balance reminder** once, 7 days before the balance due date (30 days before travel);
   - **eTA reminder** once, 21 days before travel, with the official link;
   - bookings move to **Travelling** on the first day and **Completed** the day after the trip, which schedules the review request (section 3).
5. **The My trip page** always shows the plan, payments, balance, a "before you fly" checklist and how to reach you. The link is private: only share it with the guest.

Your **Terms** page is linked from the Accept button: have it reviewed before you take real bookings (deposits, cancellations, refunds).

## 3. Reviews: how and why

When a booking is marked **Completed**, a review request is scheduled for two days later (you can change this). Every guest gets the same email with direct links to the review sites you set up (Google, TripAdvisor, SafariBookings), then **one** reminder a week later if they have not clicked.

We never offer anything in return for a review and never choose who to ask. This is required by Google, TripAdvisor and SafariBookings. Guests who ask not to be contacted (tick **Do not contact** on the contact) are never emailed.

---

## 4. Go-live checklist

Work through these in order. Each service gives you one or more **keys**: send them to your developer, or add them yourself in Vercel → your project → **Settings → Environment Variables**. The name of each variable is shown in `code`. Nothing breaks if a service is missing: the **Go-live setup** page in the back office shows what is still to do.

### A. Turn on the back office: database and photo storage (about 5 minutes, no typing)

The website already runs on Vercel. The back office (`/admin`) and the enquiry form need a **database**, and uploaded photos need **storage**. Both come from Vercel's Storage tab:

1. In Vercel, open your project **animated-flasher**, then the **Storage** tab.
2. **Create Database → Neon (Serverless Postgres)**. Pick the region closest to your guests (e.g. Europe), accept, and **Connect** it to the project (all environments). This adds the database settings automatically.
3. Still in Storage, **Create → Blob**, name it e.g. `ngina-photos`, and **Connect** it to the project. This adds the photo-storage setting automatically.
4. Go to **Deployments**, open the latest one, and choose **Redeploy**. The redeploy creates the database tables.
5. Open `https://animated-flasher.vercel.app/admin` and **create your account**. The first account is always an Admin.
6. Go to **Go-live setup → Sample content → Load sample content** to fill the site with the sample journeys, destinations and photos. Then edit or replace them; it never overwrites your own changes.

Also in **Settings → Environment Variables** add `CRON_SECRET` (any long random text, e.g. from a password manager): it switches on the daily automation (reminders, quote expiry, review requests). Recommended: add `PAYLOAD_SECRET` the same way. Then redeploy. Without `PAYLOAD_SECRET` the site derives one from the database connection, which works but logs everyone out if the database password ever changes.

When you move to your own domain (e.g. `nginatrails.com`), add `SITE_URL` with that address.

### B. Photos: Cloudflare R2 (alternative to Vercel Blob)

Only if you prefer Cloudflare to Vercel Blob for photos:

1. In Cloudflare, **R2 → Create bucket** (e.g. `ngina-media`), with public access or a custom domain such as `media.nginatrails.com`.
2. **R2 → Manage API tokens → Create token** with read & write on that bucket, then set `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` and `S3_PUBLIC_URL`. When R2 is set, it is used instead of Blob.

### Your licences, certificates and photos

Once the back office is on:
- **Licences & memberships:** Business settings → Trust. For each one, fill in the number, the expiry date (expired ones hide automatically), and optionally upload a photo or PDF of the certificate. It appears as "View certificate". Untick **Sample** to show it on the live site.
- **Photos:** upload in **Photos & videos**, then pick them on the Home page (Welcome & stage slides), Journeys, Destinations and the Wildlife guide. Always add a short description.

### C. Email: Postmark

7. Create a Postmark account and server. Add and verify your domain (Postmark shows the DNS records to add: DKIM and Return-Path).
8. Set `POSTMARK_SERVER_TOKEN` (Server → API tokens) and `POSTMARK_FROM_EMAIL` (e.g. `Ngina Trails and Safaris <hello@nginatrails.com>`).
9. Guest replies: in Postmark, open the server's **Inbound** stream and copy the inbound address into `POSTMARK_INBOUND_ADDRESS`. Choose a username and long password for `POSTMARK_INBOUND_WEBHOOK_USER` and `POSTMARK_INBOUND_WEBHOOK_PASSWORD`, and set the inbound webhook URL to `https://USER:PASSWORD@yourdomain/api/webhooks/postmark-inbound` *(next update)*.

### D. Live chat: Pusher or Ably

10. Choose one. **Pusher Channels**: create an app (cluster `eu`), then set `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` and `PUSHER_CLUSTER`. **Ably**: create an app and set `ABLY_API_KEY`. Without either, chat still works but refreshes every few seconds.

### E. Payments: Paystack (M-Pesa + card)

11. Open a Paystack Kenya business account and complete verification (business registration and KRA PIN). Enable **M-Pesa** and **Cards**; ask Paystack to enable USD if you want to charge cards in dollars.
12. Settings → API Keys & Webhooks: set `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`. Set the webhook URL to `https://yourdomain/api/webhooks/paystack`. Test with test keys first: send yourself a quote, accept it, and pay the deposit with Paystack's test card.

### F. Your domain (DNS)

13. In your domain provider (or Cloudflare DNS), add the records Vercel shows under **Project → Settings → Domains** (usually an `A` record for the root and a `CNAME` for `www`).
14. Add Postmark's DKIM and Return-Path records (step 7) and, if you use Cloudflare for R2, the media subdomain.

### G. Search and maps

15. **Google Search Console**: add your domain as a property (DNS verification), then submit `https://yourdomain/sitemap.xml` *(sitemap: next update)*.
16. **Bing Webmaster Tools**: import from Google Search Console. Optionally set `INDEXNOW_KEY` so Bing is told about every page you publish *(key file: next update)*.
17. **Google Business Profile**: create or claim "Ngina Trails and Safaris" at your Diani Beach address, with the same name, phone and hours as Business settings. Copy its **Ask for reviews** link into Business settings → Reviews.

### H. Review sites

18. **TripAdvisor**: claim your listing (Management Center), then copy your "write a review" link into Business settings → Reviews.
19. **SafariBookings**: list as an operator, then copy your review link from the operator dashboard into Business settings → Reviews.

### I. Before you announce the site

20. Fill in **Business settings**: email, phone, WhatsApp, address, hours and real licence numbers (only the ones you hold).
21. Replace sample journeys, destinations text, photos and prices. Untick **Sample** on each.
22. Have the Privacy, Terms and Cookies pages reviewed by a lawyer (they are starter text under Kenya's Data Protection Act 2019).
23. Turn off the sample banner (Business settings → Notifications).
24. Send yourself a test enquiry from your phone and check it appears in the Overview and your email.

---

## 5. Getting help

If something looks wrong, check the **Go-live setup** page first. It lists any service that is not connected. For anything else, send your developer the page address and a screenshot.
