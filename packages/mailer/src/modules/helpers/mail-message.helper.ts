import { ComposeMailDto } from '../dtos/compose-mail.dto';
import { MailMessageDto } from '../dtos/mail-message.dto';

export class MailMessageHelper {
  static compose ({ email, from }: ComposeMailDto): MailMessageDto {
    const { to, subject, title, body, url } = email;

    return {
      from,
      to,
      subject,
      text: `${title}\n\n${body}\n\n${url}`,
      html: `<h1>${title}</h1><p>${body}</p><p><a href="${url}">${url}</a></p>`
    };
  }
}
