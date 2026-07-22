import * as svc from '../services/grade.service.js';
import { successResponse } from '../utils/response.util.js';
import { generateTranscriptPDF } from '../utils/pdf.util.js';

export const getMyGrades = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyGrades(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getMyTranscript = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyTranscript(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getMyTranscriptPDF = async (req, res, next) => {
  try {
    const data = await svc.getMyTranscript(req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transkript_${data.student.studentNumber || 'ogrenci'}.pdf`,
    );
    generateTranscriptPDF(data, res);
  } catch (e) {
    next(e);
  }
};

export const updateGrade = async (req, res, next) => {
  try {
    return successResponse(res, await svc.updateGrade(req.params.enrollmentId, req.body, req.user), 'Not kaydedildi');
  } catch (e) {
    next(e);
  }
};

export const finalizeGrade = async (req, res, next) => {
  try {
    return successResponse(res, await svc.finalizeGrade(req.params.enrollmentId), 'Not kesinleştirildi');
  } catch (e) {
    next(e);
  }
};
