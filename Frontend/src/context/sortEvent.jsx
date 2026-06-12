export const sortEvents = (events, sortBy, direction) => {
  return [...events].sort((a, b) => {
    let valA, valB;

    if (sortBy === 'price') {
      valA = a.price ?? 0;
      valB = b.price ?? 0;
    } else if (sortBy === 'date') {
      valA = new Date(a.date).getTime();
      valB = new Date(b.date).getTime();
    } else if (sortBy === 'title') {
      return direction === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    return direction === 'asc' ? valA - valB : valB - valA;
  });
};