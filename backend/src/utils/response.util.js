/**
 * Standart başarı yanıtı döner.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
export const successResponse = (res, data, message = 'İşlem başarılı', statusCode = 200) => {
  const body = { success: true, message };

  if (data !== null && data !== undefined) {
    if (data && data.pagination) {
      body.data = data.data;
      body.pagination = data.pagination;
    } else {
      body.data = data;
    }
  }

  return res.status(statusCode).json(body);
};
