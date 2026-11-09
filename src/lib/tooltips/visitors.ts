/** Plain-language explanations for visitor passes, the gate and visitor rules. */
export const visitorTips = {
  "visitors.overview": "Invite guests in advance and they get a pass to show at the gate. Security checks it and lets them in — no phone calls needed.",
  "visitors.pass": "Share this code or QR with your guest. Security scans it at the gate. Anyone with the code can use it, so only send it to your guest.",
  "visitors.multiEntry": "Turn on if your guest will come and go several times during the visit, e.g. a cleaner or a weekend guest.",
  "visitors.window": "The pass only works between these times. Guests arriving up to 2 hours early are still let in.",
  "visitors.headcount": "How many people are coming together, including the guest named above.",
  "visitors.gateRequest": "Someone is at the gate asking for your house. Let them in or not — security will see your answer straight away.",
  "visitors.revoke": "Cancelling makes the pass stop working immediately.",
  "gate.check": "Type the code from the visitor's phone, or scan their QR. You'll see whether to let them in.",
  "gate.walkin": "For visitors without a pass. The household is asked to approve on their phone; you'll see the answer here.",
  "gate.override": "Only for genuine emergencies. You must give a reason. Administrators are told every time this is used.",
  "gate.inside": "Everyone who has checked in and not yet left. Tap “Check out” when they leave.",
  "visitors.inviteApproval": "If on, residents must also confirm when their invited guest actually arrives at the gate.",
  "visitors.walkinApproval": "If on, visitors without a pass can only come in once the resident approves. Recommended.",
  "visitors.assignment": "Each gate officer works for one estate. They can only check passes and see visitors for that estate.",
  "visitors.override": "A gate officer let someone in without the usual approval. Review the reason given.",
} as const;
