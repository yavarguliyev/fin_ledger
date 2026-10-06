import { BadRequestException } from '@nestjs/common';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { HtmlMetaInputDto, SafeUrlHelper } from '@common/libs';

import { LINK_PREVIEW } from '../constants/link/link-preview.constant';
import { FetchPageDto } from '../dtos/link/fetch-page.dto';
import { FetchedPageDto } from '../dtos/link/fetched-page.dto';
import { PageUrlDto } from '../dtos/link/page-url.dto';
import { PageResponseDto } from '../dtos/link/page-response.dto';

export class LinkPreviewFetchHelper {
  static async html ({ url, redirectsLeft }: FetchPageDto): Promise<HtmlMetaInputDto | null> {
    const target = SafeUrlHelper.assertHttpUrl({ url });
    const page = await LinkPreviewFetchHelper.get({ url: target });
    const isRedirect = page.status >= LINK_PREVIEW.REDIRECT_MIN && page.status <= LINK_PREVIEW.REDIRECT_MAX;

    if (isRedirect && page.location && redirectsLeft > 0) {
      return LinkPreviewFetchHelper.html({ url: new URL(page.location, target).toString(), redirectsLeft: redirectsLeft - 1 });
    }

    const isOk = page.status >= LINK_PREVIEW.OK_MIN && page.status <= LINK_PREVIEW.OK_MAX;
    return isOk && page.contentType?.includes(LINK_PREVIEW.HTML_TYPE) ? { html: page.html, url: target.toString() } : null;
  }

  private static get ({ url }: PageUrlDto): Promise<FetchedPageDto> {
    const send = url.protocol === LINK_PREVIEW.HTTPS ? httpsRequest : httpRequest;

    return new Promise<FetchedPageDto>((resolve, reject) => {
      const options = { lookup: SafeUrlHelper.guardedLookup, headers: LINK_PREVIEW.HEADERS, signal: AbortSignal.timeout(LINK_PREVIEW.TIMEOUT_MS) };
      const req = send(url, options, response => {
        void LinkPreviewFetchHelper.read({ response }).then(resolve, reject);
      });
      req.on('error', (error: NodeJS.ErrnoException) =>
        reject(error.code === LINK_PREVIEW.BLOCKED_CODE ? new BadRequestException(LINK_PREVIEW.REFUSED) : error)
      );
      req.end();
    });
  }

  private static read ({ response }: PageResponseDto): Promise<FetchedPageDto> {
    const meta = {
      status: response.statusCode ?? 0,
      ...(response.headers.location && { location: response.headers.location }),
      ...(response.headers['content-type'] && { contentType: response.headers['content-type'] })
    };

    return new Promise<FetchedPageDto>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;
      const finish = (): void => resolve({ ...meta, html: Buffer.concat(chunks).toString(LINK_PREVIEW.UTF8) });

      response.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        size += chunk.length;
        if (size >= LINK_PREVIEW.MAX_BYTES) {
          response.destroy();
          finish();
        }
      });
      response.on('end', finish);
      response.on('error', reject);
    });
  }
}
