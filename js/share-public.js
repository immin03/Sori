// Keep public shares separate from private invitations across all Sori views.
export async function sharePublic({title, text, url}, status, feedback = {}) {
  if (navigator.share) {
    try {
      await navigator.share({title, text, url});
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText([text, url].filter(Boolean).join('\n'));
    if (!status) return;
    status.textContent = feedback.copied || 'Copied to clipboard.';
    if (feedback.linkLabel) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = feedback.linkLabel;
      status.append(' ', link);
    }
  } catch {
    if (!status) return;
    const field = document.createElement('input');
    field.readOnly = true;
    field.value = url;
    field.setAttribute('aria-label', 'Public link to copy');
    status.replaceChildren('Copy this link: ', field);
    field.focus();
    field.select();
  }
}
