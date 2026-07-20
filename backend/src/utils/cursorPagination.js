export const cursorPagination = {
  async findMany({ model, where = {}, orderBy, take = 20, cursor, include, select }) {
    const params = {
      where,
      take: take + 1,
      orderBy,
      ...(include && { include }),
      ...(select && { select }),
    };

    if (cursor) {
      params.cursor = { id: cursor };
      params.skip = 1;
    }

    const items = await model.findMany(params);
    const hasNext = items.length > take;
    const data = hasNext ? items.slice(0, take) : items;
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return { data, nextCursor, hasNext };
  },

  buildCursorArgs({ cursor, take = 20 }) {
    if (!cursor) return { skip: 0, take };
    return { cursor: { id: cursor }, skip: 1, take };
  },

  paginate(items, take) {
    const hasNext = items.length > take;
    const data = hasNext ? items.slice(0, take) : items;
    const nextCursor = hasNext ? data[data.length - 1].id : null;
    return { data, nextCursor, hasNext };
  },
};
