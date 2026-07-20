import { searchRepository } from '../repositories/search.repository.js';

export const searchService = {
  search: (query, take) => searchRepository.searchAll(query, take),
  searchStudents: (query, take) => searchRepository.searchStudents(query, take),
  searchLecturers: (query, take) => searchRepository.searchLecturers(query, take),
  searchCourses: (query, take) => searchRepository.searchCourses(query, take),
  searchDepartments: (query, take) => searchRepository.searchDepartments(query, take),
  searchAnnouncements: (query, take) => searchRepository.searchAnnouncements(query, take),
};
