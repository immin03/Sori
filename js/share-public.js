/* Keep public shares on a clean origin, including when opened from an invitation. */
export async function sharePublic({title, text, url}, status) {
  try {
    if (navigator.share) {
      await navigator.share({title, text, url});
      return;
    }
    await navigator.clipboard.writeText([text, url].filter(Boolean).join('\n'));
    if (status) status.textContent = 'Copied to clipboard.';
  } catch (error) {
    if (error.name === 'AbortError' || !status) return;
    const field = document.createElement('input');
    field.readOnly = true;
    field.value = url;
    field.setAttribute('aria-label', 'Public link to copy');
    status.replaceChildren('Copy this link: ', field);
    field.select();
  }
}
