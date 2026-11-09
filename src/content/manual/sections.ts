/** Administrator user manual. Plain language, task-focused. Add a section per feature as it ships. */
export type ManualSection = { id: string; title: string; summary: string; steps?: string[]; tips?: string[] };

export const manualSections: ManualSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "The administration area is where your team manages estates, houses, residents and access. Everything you can see depends on the role on your account.",
    steps: [
      "Sign in at /login with your email and password.",
      "Use the menu (left on a computer, bottom bar on a phone) to move between sections.",
      "Look for the ⓘ icons — tap or hover to get a plain-language explanation of any feature.",
    ],
    tips: ["Your session stays signed in on your own device. Always sign out on shared computers."],
  },
  {
    id: "estates",
    title: "Setting up estates",
    summary: "An estate is a group of houses. Create estates first, then add houses inside them.",
    steps: ["Go to Estates and tap “New estate”.", "Enter the estate's name. Location, address and description are optional.", "Tap “Create estate”."],
    tips: ["Archiving an estate hides it from everyday lists but deletes nothing. You can restore it at any time."],
  },
  {
    id: "houses",
    title: "Adding and managing houses",
    summary: "Every resident, bill and visitor is linked to a house, so keep your house list accurate.",
    steps: [
      "Open Houses (or an estate's page) and tap “New house”.",
      "Choose the estate, then enter the house number or name and where it is within the estate.",
      "Optional details such as block, category, rooms and bedrooms make searching and reporting easier.",
    ],
    tips: [
      "“Occupied” is set automatically when you assign a resident and cleared when the last resident leaves.",
      "Houses that have ever had residents can't be deleted. Deactivate them instead so history is preserved.",
    ],
  },
  {
    id: "residents",
    title: "Adding residents",
    summary: "Residents can't sign themselves up. You create their account, and they receive an email to choose a password.",
    steps: [
      "Go to Residents and tap “New resident” (or use “Add resident” on a house page).",
      "Enter their name and email. Phone is optional.",
      "Pick their estate and house, and whether they are the main contact.",
      "Leave “Email them an invitation” selected and tap “Create resident”.",
    ],
    tips: [
      "Only set a temporary password if the resident truly can't receive email.",
      "One house can have several residents, and one resident can be linked to more than one house.",
    ],
  },
  {
    id: "moving",
    title: "Moving in, moving out and moving house",
    summary: "Stays are recorded with start and end dates so you always have a full history of who lived where.",
    steps: [
      "Open the resident and find “Homes”.",
      "To move them, tap “Move”, choose the new house and give a short reason. The old stay ends and the new one starts the same day.",
      "When someone leaves, tap “End stay” and give a reason. Their records remain available.",
    ],
  },
  {
    id: "accounts",
    title: "Passwords and deactivating accounts",
    summary: "You never see or set anyone's password directly — you send them a secure reset link instead.",
    steps: [
      "Open the person's page and choose “Send password reset”.",
      "To stop someone signing in, choose “Deactivate account” and give a reason. Nothing is deleted.",
      "Use “Reactivate account” to let them back in.",
    ],
  },
  {
    id: "roles",
    title: "Team members, roles and permissions",
    summary: "A role is a named set of permissions (for example “Accountant”). Give each team member one or more roles.",
    steps: [
      "Go to Team & roles → Roles & permissions to create a role and tick what it may do. Each permission is explained in plain words.",
      "Go to Team & roles → Team → “Add team member”, enter their details and choose their roles.",
      "Tap a team member to change their roles later.",
    ],
    tips: [
      "Changes apply within about a minute, the next time the person's session refreshes.",
      "The Administrator, Resident and Security Officer roles are built in and can't be deleted. Administrator always has full access.",
      "You can't remove your own administrator access, so the system can never be left without an administrator by accident.",
    ],
  },
  {
    id: "charge-types",
    title: "Billing setup: charge types and rules",
    summary: "Charge types are the things you bill for (service charge, water, electricity…). The common ones are already set up.",
    steps: [
      "Open Billing setup → Charge types to add your own, with an optional usual amount that pre-fills new bills.",
      "Switch off a charge type you no longer use — old bills keep it, but it can't be used for new ones.",
      "Under Settings choose whether residents can pay part of a bill, whether they pay the card fee, and when reminders appear.",
    ],
    tips: ["Card fee: Paystack takes about 1.5% + ₦100 (max ₦2,000). With “Residents pay the card fee” on, the estate always receives the full bill amount."],
  },
  {
    id: "bills",
    title: "Sending bills",
    summary: "Bill a whole estate or chosen houses in one go. The same charge can't be billed twice to a house for the same period.",
    steps: [
      "Go to Bills → “Create bills”.",
      "Choose the charge type, amount per house, billing duration (e.g. Monthly) and any day in the period.",
      "Set the due date, then choose a whole estate or specific houses.",
      "Tick “Save as drafts” to check them first, or send straight away. Drafts are sent with “Send drafts”.",
    ],
    tips: ["If a house already has that charge for the period, it is skipped and you're told how many were skipped."],
  },
  {
    id: "recurring",
    title: "Recurring charges",
    summary: "Let the system create regular bills for you — for example the service charge on the 1st of every month.",
    steps: [
      "Open Billing setup → Recurring charges → “New recurring charge”.",
      "Pick the charge type, amount, how often, the estate, the first bill date and how many days residents have to pay.",
      "Pause or resume it at any time. “Run due charges now” creates any bills that are due straight away.",
    ],
    tips: ["If the system was off for a while, missed periods are caught up automatically — never duplicated."],
  },
  {
    id: "corrections",
    title: "Correcting a bill",
    summary: "Bills are never edited after they are sent. Corrections are recorded next to the bill with a reason, so the history is always clear.",
    steps: [
      "Open the bill and tap “Correct”.",
      "Choose Reduce (credit), Increase (debit), Write off (forgive what's left) or Cancel (only if nothing has been paid).",
      "Give a short reason and save.",
    ],
  },
  {
    id: "payments",
    title: "Payments: online, offline and refunds",
    summary: "Residents pay online with Paystack. Every attempt — even failed ones — is kept. Money paid by transfer or cash can be recorded by staff.",
    steps: [
      "Online payments appear under Payments automatically once Paystack confirms them. A payment still ‘pending’ is re-checked every few minutes; you can also tap “Check with Paystack”.",
      "To record a transfer or cash: Payments → “Record payment”, choose the house, tick the bills and amounts, and enter the bank or receipt reference.",
      "To refund (administrators only): open the payment → “Refund”, enter the amount and reason. The original payment stays on record and the refund is added as a new entry.",
      "Receipts can be opened from any successful payment and printed or saved as PDF.",
    ],
    tips: ["Residents get a gentle reminder pop-up for bills due within 7 days, due tomorrow, or overdue. There are no late penalties."],
  },
  {
    id: "finance",
    title: "Finance reports and exports",
    summary: "See what was billed, collected and is still owed, by charge type and by estate, for any date range.",
    steps: ["Open Finance, pick a date range (or a preset) and optionally one estate.", "Use “Bills CSV” or “Payments CSV” to download a spreadsheet for Excel or Google Sheets."],
    tips: ["Every export is recorded in the activity log."],
  },
  {
    id: "support",
    title: "Maintenance and support requests",
    summary: "Residents report problems from their app — with photos — and follow progress. Your team handles them under Support.",
    steps: [
      "Open Support. “Needs attention” shows everything that isn't resolved or closed, most recently active first.",
      "Open a request to see the conversation and photos. Choose “Reply to resident” or “Internal note” (staff only), and optionally change the status in the same step.",
      "Set the priority on the right so urgent jobs stand out.",
      "When the work is done, mark it Resolved. The resident is asked to confirm it's fixed — or reopen it if not.",
    ],
    tips: [
      "Residents are notified when you reply or change the status. They never see internal notes or staff-only files.",
      "Manage the list of categories (Plumbing, Electrical…) on the Categories tab. Hiding one keeps old requests intact.",
    ],
  },
  {
    id: "notices",
    title: "Notices",
    summary: "Send announcements to everyone, one estate, or a single house. Residents see them in their app and get a notification.",
    steps: [
      "Open Notices → “New notice”, write a title and message, and attach a flyer if you like.",
      "Choose who sees it and how important it is (For information, Important, Urgent).",
      "Publish now, schedule it for later, or save it as a draft. You can also set a date when it stops showing.",
    ],
    tips: ["Archive a notice to take it down. It stays in your records."],
  },
  {
    id: "visitors",
    title: "Visitors and passes",
    summary: "Residents invite guests from their app. Each guest gets a pass — a code and QR — that security checks at the gate. Everything is recorded under Visitors.",
    steps: [
      "Residents tap Visitors → “Invite a visitor”, choose when the guest is coming and share the pass by WhatsApp or text.",
      "At the gate, security checks the code and sees the visitor's name, house and whether to let them in.",
      "Open Visitors in the admin area to see who's expected today, who's inside now, every visit, all passes and any requests made at the gate.",
      "To stop a pass working, find it under Passes and choose Cancel. You'll be asked for a reason.",
    ],
    tips: [
      "Passes work only during the time the resident chose. Guests up to 2 hours early are still let in; expired passes are refused.",
      "Visit records can't be edited or deleted. A visitor can only be checked out once.",
      "The Overrides filter on the Visits tab shows every time security let someone in without approval, with the reason they gave.",
    ],
  },
  {
    id: "visitor-rules",
    title: "Visitor rules for each estate",
    summary: "Each estate has two switches, found on the estate's page under “Visitor rules”.",
    steps: [
      "“Visitors without a pass need the resident's OK” — on by default. Security asks the household on their phone and waits for a yes.",
      "“Residents confirm when an invited guest arrives” — off by default. Turn on for extra security: even guests with a pass wait for the resident to confirm.",
    ],
    tips: ["Changes take effect straight away at the gate."],
  },
  {
    id: "gate-officers",
    title: "Gate officers",
    summary: "Security staff use a simple gate app on a phone or tablet. Each officer works for one estate and only sees that estate's visitors.",
    steps: [
      "Add the person under Team & roles → Team with the “Security officer” role (or any role that can check visitor passes).",
      "Open Visitors → Gate officers, pick the team member and their estate, and choose Assign. To move them to another estate, assign again.",
      "The officer signs in at the usual sign-in page and goes straight to the gate app: Check pass, Walk-in, Inside, Recent.",
    ],
    tips: [
      "An officer who isn't assigned to an estate can't check any passes.",
      "Emergency override lets an officer admit someone without approval. A reason is required and administrators are notified every time.",
      "Override is a separate permission (visitors.override). Remove it from a role under Team & roles to switch override off for those officers.",
    ],
  },
  {
    id: "listings",
    title: "Website listings",
    summary: "The homes shown on your public website are managed under Listings. Changes appear on the website within about a minute.",
    steps: [
      "Open Listings → “New listing”. Enter the name, home type, location, starting price and bedrooms, then choose “Create listing”.",
      "On the next screen, add photos with “Add photos” (you can pick several at once). The first photo is the cover — use the arrows to reorder.",
      "Write a short description (shown on cards and in Google) and, if you like, a full description and a list of features. Choose “Save changes”.",
      "Turn on “Live on the website” to publish it. Turn on “Feature on the home page” to show it in the home page's featured section (up to four appear).",
    ],
    tips: [
      "New listings start hidden, so you can prepare them in private. A listing needs at least one photo and a short description before it can go live.",
      "To take a listing down, turn off “Live on the website”. Nothing is deleted, and earlier enquiries about it are kept.",
      "Photos must be JPG, PNG or WebP and no larger than 10 MB. Landscape photos look best.",
      "Only people with the “Edit the public website” permission can see Listings.",
    ],
  },
  {
    id: "enquiries",
    title: "Website enquiries",
    summary: "Every message sent from the website's contact and property forms lands in Enquiries. Everyone with access sees all of them, and gets a notification when a new one arrives.",
    steps: [
      "Open Enquiries. “To handle” shows everything nobody has dealt with yet, newest first.",
      "Open an enquiry to see the message, which listing it's about and where the person came from (for example a Google ad). Tap the phone number to call, or use WhatsApp or email.",
      "Add a note so the team knows what happened, e.g. “Called — viewing booked for Saturday”.",
      "Choose “Mark as handled”. It moves to the Handled tab. If you need to pick it up again, choose “Move back to ‘To handle’”.",
    ],
    tips: [
      "If the same person has written before, their earlier enquiries are listed at the bottom.",
      "The Overview page shows how many enquiries are still waiting.",
      "Viewing enquiries and ticking them off are separate permissions, so you can give someone view-only access.",
    ],
  },
  {
    id: "journal",
    title: "Writing journal articles",
    summary: "Articles in the website's Journal section are written under Website → Journal. They stay private drafts until you publish them.",
    steps: [
      "Choose “New article”, type a working headline and choose “Create draft”.",
      "Write a short summary, then build the article from blocks: paragraphs, headings, bullet lists, quotes and photos. Use the arrows to reorder blocks.",
      "Add a cover photo, a category, tags and the author's name on the right. Choose “Save draft” as often as you like.",
      "When it's ready, choose “Publish now”, or pick a date and time and choose “Schedule” — it goes live by itself.",
    ],
    tips: [
      "An article needs a cover photo, a summary and some text before it can be published.",
      "The web address is set from the headline when the article is first published and then never changes, so shared links keep working.",
      "“Back to draft” takes an article off the website; “Archive” puts it away. Neither deletes anything.",
      "The “Search engines” boxes control what Google shows. Leave them empty to use the headline and summary.",
    ],
  },
  {
    id: "site-content",
    title: "Contact details, FAQs and testimonials",
    summary: "Website → Site content holds the text that appears across the website. Changes show on the site within about a minute.",
    steps: [
      "Contact details: update the phone numbers, email, address and opening hours, and your social media links, then choose “Save contact details”.",
      "FAQs: add, edit, reorder, hide or delete questions. Hidden questions stay in the list for later.",
      "Testimonials: add a client's words only if they have agreed to them being published. New testimonials start hidden — switch “Shown” on when you're ready. Tap the round photo to add a picture.",
      "Search engines: set what Google shows for each main page (Home, About, Contact…).",
    ],
    tips: [
      "The home page shows a testimonials section only when at least one testimonial is shown.",
      "Listings and articles have their own “Search engines” boxes on their edit screens.",
    ],
  },
  {
    id: "insights",
    title: "Website insights",
    summary: "Website → Insights shows how many people visit the website, which listings and pages they look at, and where enquiries come from.",
    steps: [
      "Choose a period: 7, 30 or 90 days.",
      "The cards show visitors, listing views, enquiries and the enquiry rate (enquiries for every 100 visitors).",
      "The charts show visitors and enquiries day by day. Hover over or tap a day to see its number, or open “Show as a table”.",
      "The lists below show where enquiries came from (for example a Google ad or Instagram), what people asked about, and the most viewed listings and pages.",
    ],
    tips: [
      "The website counts visits itself, without cookies or personal data, so the numbers are a guide rather than exact.",
      "Visitors are counted per device: one person on a phone and a laptop counts twice.",
      "Only people with the “See website visitor and enquiry statistics” permission can see Insights.",
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    summary: "The bell at the top shows updates — new requests and replies for staff; bills, payments, request updates and notices for residents.",
    tips: [
      "Notifications arrive instantly while the app is open and are stored, so nothing is missed offline.",
      "Bill reminders go out 7 days and 1 day before the due date, and when a bill becomes overdue — each one only once.",
    ],
  },
  {
    id: "activity",
    title: "The activity log",
    summary: "Every important change — who did it, when, what changed and why — is recorded permanently. Records can't be edited or deleted by anyone using the application.",
    tips: ["House and resident pages show their own history. The full log is under Activity log for people with that permission."],
  },
];
