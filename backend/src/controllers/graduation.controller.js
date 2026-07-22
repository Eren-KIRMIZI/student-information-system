import * as svc from '../services/graduation.service.js';
import * as transcriptSvc from '../services/transcript.service.js';
import { successResponse } from '../utils/response.util.js';

export const getMyTranscript = async (req, res, next) => {
  try {
    return successResponse(res, await transcriptSvc.getMyTranscript(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const getTranscriptForStudent = async (req, res, next) => {
  try {
    return successResponse(res, await transcriptSvc.getTranscriptForAdmin(req.params.studentId));
  } catch (e) {
    next(e);
  }
};

export const getMyGraduationStatus = async (req, res, next) => {
  try {
    return successResponse(res, await svc.getMyGraduationStatus(req.user.id));
  } catch (e) {
    next(e);
  }
};

export const checkStudentGraduation = async (req, res, next) => {
  try {
    return successResponse(res, await svc.checkStudentGraduation(req.params.studentId));
  } catch (e) {
    next(e);
  }
};

export const setGraduationRequirement = async (req, res, next) => {
  try {
    return successResponse(
      res,
      await svc.setGraduationRequirement(req.params.departmentId, req.body),
      'Mezuniyet kuralı güncellendi',
    );
  } catch (e) {
    next(e);
  }
};
