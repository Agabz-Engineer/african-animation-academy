const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const EMAIL_LOCAL_PART_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
const EMAIL_TLD_PATTERN = /^[A-Za-z]{2,63}$/;

export const normalizeEmailAddress = (value: string) => value.trim().toLowerCase();

const sanitizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, "");
};

export const getEmailValidationError = (value: string) => {
  const email = normalizeEmailAddress(value);

  if (!email) {
    return "Email is required.";
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return "Email address is too long.";
  }

  if (email.includes("..")) {
    return "Enter a valid email address.";
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return "Enter a valid email address.";
  }

  const [localPart, domain] = parts;
  if (!localPart || !domain) {
    return "Enter a valid email address.";
  }

  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return "Email address is too long.";
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    !EMAIL_LOCAL_PART_PATTERN.test(localPart)
  ) {
    return "Enter a valid email address.";
  }

  const domainLabels = domain.split(".");
  if (
    domainLabels.length < 2 ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domainLabels.some((label) => !EMAIL_DOMAIN_LABEL_PATTERN.test(label))
  ) {
    return "Enter a valid email address.";
  }

  const topLevelDomain = domainLabels[domainLabels.length - 1];
  if (!EMAIL_TLD_PATTERN.test(topLevelDomain)) {
    return "Enter a valid email address.";
  }

  return null;
};

export const getSignupEmailRedirectUrl = (request: Request) => {
  const baseUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) || new URL(request.url).origin;
  return `${baseUrl.replace(/\/$/, "")}/auth/callback`;
};

export const getAuthCallbackRedirectUrl = (fallbackOrigin?: string | null) => {
  const baseUrl = sanitizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) || sanitizeBaseUrl(fallbackOrigin);
  return baseUrl ? `${baseUrl}/auth/callback` : null;
};

export const getPasswordRecoveryRedirectUrl = (fallbackOrigin?: string | null) => {
  const callbackUrl = getAuthCallbackRedirectUrl(fallbackOrigin);
  return callbackUrl ? `${callbackUrl}?next=/update-password` : null;
};
