export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.round(secondsPast)} seconds ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.round(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast <= 86400) {
    return `${Math.round(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast > 86400) {
    const daysPast = Math.round(secondsPast / 86400);
    return daysPast === 1 ? `${daysPast} day ago` : `${daysPast} days ago`;
  }
}
