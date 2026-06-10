export const templateOptions = ['classic', 'editorial', 'garden'] as const;

export type InvitationTemplate = (typeof templateOptions)[number];
