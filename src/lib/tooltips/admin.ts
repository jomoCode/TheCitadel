/** Plain-language explanations for the administration and resident areas. */
export const adminTips = {
  // Overview
  "admin.overview": "A quick snapshot of your estates. Tap any number to see the full list behind it.",
  "admin.occupancyRate": "The share of usable houses that currently have at least one resident living in them.",
  // Estates
  "admin.estates": "An estate is a group of houses, for example 'Citadel Gardens'. Every house belongs to exactly one estate.",
  "admin.estate.name": "The name people know the estate by. It must be different from your other estates.",
  "admin.estate.archive": "Archiving hides an estate from day-to-day lists without deleting any of its history. You can bring it back later.",
  "estate.status.active": "The estate is in use.",
  "estate.status.archived": "Hidden from day-to-day use. Nothing has been deleted.",
  // Houses
  "admin.houses": "Each home inside an estate. Residents, bills and visitors are all linked to a house.",
  "admin.house.identifier": "The house number or name residents use, e.g. 'A12' or 'Palm Villa'. It must be unique within the estate.",
  "admin.house.location": "Where the house is within the estate, e.g. 'North wing, Block A'.",
  "admin.house.category": "The type of home, e.g. '3-bed terrace' or 'Penthouse'. Useful for filtering and reports.",
  "admin.house.delete": "Houses that have ever had residents can't be deleted, so their history is never lost. Deactivate them instead.",
  "admin.house.deactivate": "Deactivating takes the house out of use. Its history stays. You can reactivate it any time.",
  "house.status.available": "Empty and ready for a new resident.",
  "house.status.occupied": "At least one resident lives here. This is set automatically when you assign someone.",
  "house.status.reserved": "Being held for someone who hasn't moved in yet.",
  "house.status.under_maintenance": "Undergoing repairs. Residents can still be assigned if they are living there during the work.",
  "house.status.inactive": "Taken out of use. No one can be assigned until it is reactivated.",
  // Residents
  "admin.residents": "People who live in your estates. Each resident gets their own login to the resident app.",
  "admin.resident.invite":
    "If you leave the password empty, we email the resident a link to choose their own password. This is the safest option.",
  "admin.resident.tempPassword": "Only use this if the resident can't receive email. Ask them to change it after first login.",
  "admin.resident.primary": "The main contact for the house. Bills and important notices go to them first.",
  "admin.resident.endStay":
    "Use this when someone moves out. Their records stay available; they just stop being linked to the house from that date.",
  "admin.resident.move": "Moves the resident to another house in one step: their old stay ends and a new one starts on the same day.",
  "admin.resident.deactivate": "Stops this person from signing in. Nothing is deleted, and you can reactivate the account later.",
  "admin.resident.reset": "Sends the person an email with a link to choose a new password. You never see their password.",
  "admin.occupancyHistory": "Everyone who has lived in this house, with move-in and move-out dates. History is never deleted.",
  "admin.activityLog": "Every important change made here, who made it and when. These records can't be edited or deleted.",
  // Access
  "admin.access": "Control who can do what. Give each staff member a role; each role is a set of allowed actions.",
  "admin.roles": "A role is a named set of permissions, like 'Accountant'. Change a role once and everyone with that role is updated.",
  "admin.role.system": "Built-in role. It can't be deleted, and the Administrator role always keeps full access.",
  "admin.staff": "People who work for the company: administrators, security officers and anyone with a custom role.",
  "admin.permissionsApply": "Changes apply the next time each person's session refreshes — usually within a minute.",
  // Resident portal
  "resident.primary": "You are the main contact for this home. Bills and important notices are addressed to you.",
  "resident.phone": "We use this number to reach you about your home, deliveries and visitors.",
  "resident.password": "Choose at least 10 characters. A short sentence you'll remember is a great password.",
} as const;
