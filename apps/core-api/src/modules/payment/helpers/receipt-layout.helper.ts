import { RECEIPT } from '../constants/receipt/receipt.constant';
import { RECEIPT_LAYOUT as L } from '../constants/receipt/receipt-layout.constant';
import { ReceiptDrawDto } from '../dtos/receipt/receipt-draw.dto';
import { ReceiptSectionDto } from '../dtos/receipt/receipt-section.dto';

const CONTENT_WIDTH = L.PAGE_WIDTH - L.MARGIN * L.HALF;
const RIGHT_EDGE = L.PAGE_WIDTH - L.MARGIN;

export class ReceiptLayoutHelper {
  static header ({ document, receipt }: ReceiptDrawDto): void {
    const { HEADER } = L;
    document.rect(0, 0, L.PAGE_WIDTH, HEADER.HEIGHT).fill(L.COLORS.PRIMARY);
    document.roundedRect(L.MARGIN, HEADER.LOGO_TOP, HEADER.LOGO_SIZE, HEADER.LOGO_SIZE, HEADER.LOGO_RADIUS).fill(L.COLORS.WHITE);
    document
      .font(L.FONTS.BOLD)
      .fontSize(HEADER.BRAND_SIZE)
      .fillColor(L.COLORS.PRIMARY)
      .text(RECEIPT.LOGO_LETTER, L.MARGIN, HEADER.LOGO_TOP + HEADER.LOGO_SIZE / L.HALF - HEADER.BRAND_SIZE / L.HALF, { width: HEADER.LOGO_SIZE, align: L.ALIGN.CENTER });

    const textLeft = L.MARGIN + HEADER.LOGO_SIZE + HEADER.LOGO_RADIUS + HEADER.LOGO_RADIUS / L.HALF;
    document.fontSize(HEADER.BRAND_SIZE).fillColor(L.COLORS.WHITE).text(RECEIPT.BRAND, textLeft, HEADER.LOGO_TOP);
    document.font(L.FONTS.REGULAR).fontSize(HEADER.SUBTITLE_SIZE).fillColor(L.COLORS.ON_PRIMARY_MUTED).text(RECEIPT.PLATFORM_NAME, textLeft);

    document
      .fontSize(HEADER.TITLE_SIZE)
      .fillColor(L.COLORS.ON_PRIMARY_MUTED)
      .text(RECEIPT.TITLE, L.MARGIN, HEADER.LOGO_TOP, { width: CONTENT_WIDTH, align: L.ALIGN.RIGHT, characterSpacing: L.LETTER_SPACING });
    document.font(L.FONTS.BOLD).fontSize(HEADER.NUMBER_SIZE).fillColor(L.COLORS.WHITE).text(receipt.receiptNumber, L.MARGIN, undefined, { width: CONTENT_WIDTH, align: L.ALIGN.RIGHT });
  }

  static amount ({ document, receipt }: ReceiptDrawDto): void {
    const { AMOUNT } = L;
    const inner = L.MARGIN + AMOUNT.PADDING;
    document.roundedRect(L.MARGIN, AMOUNT.TOP, CONTENT_WIDTH, AMOUNT.HEIGHT, AMOUNT.RADIUS).fillAndStroke(L.COLORS.CARD, L.COLORS.DIVIDER);
    document.font(L.FONTS.REGULAR).fontSize(AMOUNT.LABEL_SIZE).fillColor(L.COLORS.MUTED).text(receipt.amountLabel, inner, AMOUNT.TOP + AMOUNT.PADDING);
    document.moveDown(AMOUNT.LABEL_GAP);
    document.font(L.FONTS.BOLD).fontSize(AMOUNT.VALUE_SIZE).fillColor(L.COLORS.TEXT).text(receipt.amount, inner);
    document
      .font(L.FONTS.REGULAR)
      .fontSize(AMOUNT.DATE_SIZE)
      .fillColor(L.COLORS.MUTED)
      .text(`${RECEIPT.LABELS.PAID_ON}${RECEIPT.SPACE}${receipt.issuedAt}`, inner);

    document.font(L.FONTS.BOLD).fontSize(AMOUNT.PILL_SIZE);
    const pillWidth = document.widthOfString(receipt.status, { characterSpacing: L.LETTER_SPACING }) + AMOUNT.PILL_PADDING * L.HALF;
    const pillLeft = RIGHT_EDGE - AMOUNT.PADDING - pillWidth;
    const pillTop = AMOUNT.TOP + AMOUNT.PADDING;
    document.roundedRect(pillLeft, pillTop, pillWidth, AMOUNT.PILL_HEIGHT, AMOUNT.PILL_HEIGHT / L.HALF).fill(L.COLORS.SUCCESS_BG);
    document
      .fillColor(L.COLORS.SUCCESS)
      .text(receipt.status, pillLeft, pillTop + (AMOUNT.PILL_HEIGHT - AMOUNT.PILL_SIZE) / L.HALF + L.TEXT_OFFSET, {
        width: pillWidth,
        align: L.ALIGN.CENTER,
        characterSpacing: L.LETTER_SPACING
      });
  }

  static details ({ document, receipt }: ReceiptDrawDto): void {
    const { DETAILS, BILLED } = L;
    ReceiptLayoutHelper.sectionTitle({ document, title: RECEIPT.LABELS.DETAILS, top: DETAILS.TOP });

    const rows: [string, string][] = [
      [RECEIPT.LABELS.NUMBER, receipt.receiptNumber],
      [RECEIPT.LABELS.DATE, receipt.issuedAt],
      [RECEIPT.LABELS.TYPE, receipt.typeLabel],
      [RECEIPT.LABELS.METHOD, receipt.method],
      [RECEIPT.LABELS.PAYMENT_ID, receipt.paymentId],
      ...(receipt.providerReference ? [[RECEIPT.LABELS.PROVIDER_REFERENCE, receipt.providerReference] as [string, string]] : [])
    ];

    let top = DETAILS.TOP + DETAILS.TITLE_GAP;
    for (const [label, value] of rows) {
      const textTop = top + (DETAILS.ROW_HEIGHT - DETAILS.LABEL_SIZE) / L.HALF;
      document.font(L.FONTS.REGULAR).fontSize(DETAILS.LABEL_SIZE).fillColor(L.COLORS.MUTED).text(label, L.MARGIN, textTop);
      document
        .font(L.FONTS.BOLD)
        .fontSize(DETAILS.VALUE_SIZE)
        .fillColor(L.COLORS.TEXT)
        .text(value, RIGHT_EDGE - DETAILS.VALUE_WIDTH, textTop, { width: DETAILS.VALUE_WIDTH, align: L.ALIGN.RIGHT });
      top += DETAILS.ROW_HEIGHT;
      document.moveTo(L.MARGIN, top).lineTo(RIGHT_EDGE, top).lineWidth(L.TEXT_OFFSET).stroke(L.COLORS.DIVIDER);
    }

    top += BILLED.GAP;
    ReceiptLayoutHelper.sectionTitle({ document, title: RECEIPT.LABELS.BILLED_TO, top });
    document.font(L.FONTS.BOLD).fontSize(BILLED.NAME_SIZE).fillColor(L.COLORS.TEXT).text(receipt.customerName, L.MARGIN, top + DETAILS.TITLE_GAP);
  }

  static footer ({ document, receipt }: ReceiptDrawDto): void {
    const { FOOTER } = L;
    const top = L.PAGE_HEIGHT - FOOTER.OFFSET;
    document.moveTo(L.MARGIN, top).lineTo(RIGHT_EDGE, top).lineWidth(L.TEXT_OFFSET).stroke(L.COLORS.DIVIDER);
    document.font(L.FONTS.REGULAR).fontSize(FOOTER.SIZE).fillColor(L.COLORS.MUTED).text(RECEIPT.FOOTER, L.MARGIN, top + FOOTER.LINE_GAP, { width: CONTENT_WIDTH });
    document.text(`${RECEIPT.GENERATED_PREFIX}${receipt.generatedAt}`, L.MARGIN, undefined, { width: CONTENT_WIDTH });
    document
      .font(L.FONTS.BOLD)
      .fillColor(L.COLORS.PRIMARY)
      .text(RECEIPT.BRAND, L.MARGIN, top + FOOTER.LINE_GAP, { width: CONTENT_WIDTH, align: L.ALIGN.RIGHT });
  }

  private static sectionTitle ({ document, title, top }: ReceiptSectionDto): void {
    document
      .font(L.FONTS.BOLD)
      .fontSize(L.DETAILS.TITLE_SIZE)
      .fillColor(L.COLORS.MUTED)
      .text(title, L.MARGIN, top, { characterSpacing: L.LETTER_SPACING });
  }
}
