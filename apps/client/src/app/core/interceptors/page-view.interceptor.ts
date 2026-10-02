import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { PageViewTrackerService } from '../services/page-view-tracker.service';

export const pageViewInterceptor: HttpInterceptorFn = (req, next) => {
  inject(PageViewTrackerService).record({ method: req.method, url: req.urlWithParams });
  return next(req);
};
