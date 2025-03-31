export function getRelativeTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - date;
    
    // Convert milliseconds to seconds
    const seconds = Math.floor(diff / 1000);
    
    // Less than a minute
    if (seconds < 60) {
      return 'Just now';
    }
    
    // Minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes === 1 ? '1 minut siden' : `${minutes} minutter siden`;
    }
    
    // Hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? '1 time siden' : `${hours} timer siden`;
    }
    
    // Days
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return days === 1 ? '1 dag siden' : `${days} dage siden`;
    }
    
    // Weeks
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return weeks === 1 ? '1 uge siden' : `${weeks} uger siden`;
    }
    
    // Months
    const months = Math.floor(days / 30);
    if (months < 12) {
      return months === 1 ? '1 måned' : `${months} måneder siden`;
    }
    
    // Years
    const years = Math.floor(days / 365);
    return years === 1 ? '1 år' : `${years} år siden`;
  }