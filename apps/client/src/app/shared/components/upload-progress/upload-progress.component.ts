import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { UPLOAD_PROGRESS } from '../../../core/constants/http/upload-progress.constant';

@Component({
  selector: 'app-upload-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-progress.component.html'
})
export class UploadProgressComponent {
  readonly progress = input.required<number>();
  readonly cancelled = output();
  readonly labels = UPLOAD_PROGRESS;
}
