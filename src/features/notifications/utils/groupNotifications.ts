export const groupNotifications = (notifications: any[]) => {
  const groups: Record<string, any[]> = {};

  const now = new Date();

  notifications.forEach((n) => {
    const date = new Date(n.created_at);

    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    let label = '';

    if (diff === 0) label = 'Hoy';
    else if (diff === 1) label = 'Ayer';
    else label = date.toLocaleDateString();

    if (!groups[label]) {
      groups[label] = [];
    }

    groups[label].push(n);
  });

  return groups;
};