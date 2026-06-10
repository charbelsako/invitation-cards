export const templateOptions = ['horizontal', 'vertical', 'envelope'] as const;

export type InvitationTemplate = (typeof templateOptions)[number];
