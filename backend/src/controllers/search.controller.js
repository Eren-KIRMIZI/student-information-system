import { searchService } from '../services/search.service.js';
import { successResponse } from '../utils/response.util.js';

const MAX_SEARCH_LIMIT = 50;

const capLimit = (limit) => Math.min(Math.max(parseInt(limit) || 10, 1), MAX_SEARCH_LIMIT);

export const searchController = {
  searchAll: async (req, res, next) => {
    try {
      const { q, limit } = req.query;
      if (!q || q.trim().length < 2) {
        return successResponse(
          res,
          { students: [], lecturers: [], courses: [], departments: [], announcements: [] },
          200,
        );
      }
      const results = await searchService.search(q.trim(), capLimit(limit));
      successResponse(res, results, 200);
    } catch (err) {
      next(err);
    }
  },

  searchStudents: async (req, res, next) => {
    try {
      const { q, limit } = req.query;
      if (!q) return successResponse(res, [], 200);
      const results = await searchService.searchStudents(q.trim(), capLimit(limit));
      successResponse(res, results, 200);
    } catch (err) {
      next(err);
    }
  },

  searchLecturers: async (req, res, next) => {
    try {
      const { q, limit } = req.query;
      if (!q) return successResponse(res, [], 200);
      const results = await searchService.searchLecturers(q.trim(), capLimit(limit));
      successResponse(res, results, 200);
    } catch (err) {
      next(err);
    }
  },

  searchCourses: async (req, res, next) => {
    try {
      const { q, limit } = req.query;
      if (!q) return successResponse(res, [], 200);
      const results = await searchService.searchCourses(q.trim(), capLimit(limit));
      successResponse(res, results, 200);
    } catch (err) {
      next(err);
    }
  },
};
