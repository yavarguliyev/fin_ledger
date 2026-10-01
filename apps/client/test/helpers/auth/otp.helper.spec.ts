import { OtpHelper } from '../../../src/app/core/helpers/auth/otp.helper';
import { OTP } from '../../../src/app/core/constants/auth/otp.constant';

const CODE = '483920';
const LENGTH = OTP.LENGTH;

const typeCode = (code: string): string[] =>
  code.split('').reduce<string[]>((digits, digit, index) => OtpHelper.write({ digits, index, digit, length: LENGTH }), []);

describe('OtpHelper', () => {
  it('breaks the boxes into Apple-style groups', () => {
    expect(OtpHelper.startsGroup(0)).toBe(false);
    expect(OtpHelper.startsGroup(OTP.GROUP_SIZE)).toBe(true);
    expect(OtpHelper.startsGroup(OTP.GROUP_SIZE + 1)).toBe(false);
  });

  it('reports completion only once every box holds a digit', () => {
    const partial = typeCode('4839');

    expect(OtpHelper.isComplete({ digits: partial, length: LENGTH })).toBe(false);
    expect(OtpHelper.isComplete({ digits: typeCode(CODE), length: LENGTH })).toBe(true);
  });

  it('builds the value in box order regardless of gaps', () => {
    const digits = OtpHelper.write({ digits: [], index: 2, digit: '7', length: LENGTH });

    expect(OtpHelper.value({ digits, length: LENGTH })).toBe('7');
    expect(OtpHelper.isComplete({ digits, length: LENGTH })).toBe(false);
  });

  it('spreads a pasted code across the boxes from the caret', () => {
    const digits = OtpHelper.fill({ digits: [], from: 0, text: CODE, length: LENGTH });

    expect(OtpHelper.value({ digits, length: LENGTH })).toBe(CODE);
  });

  it('never writes past the last box when a long code is pasted', () => {
    const digits = OtpHelper.fill({ digits: [], from: LENGTH - 2, text: CODE, length: LENGTH });

    expect(digits).toHaveLength(LENGTH);
    expect(OtpHelper.value({ digits, length: LENGTH })).toBe(`....${CODE.slice(0, 2)}`.replace(/\./g, ''));
  });

  it('strips anything that is not a digit, including spaces from a pasted code', () => {
    expect(OtpHelper.sanitize('4 8-3a9')).toBe('4839');
    expect(OtpHelper.sanitize('abc')).toBe('');
  });

  it('ignores a write outside the box range', () => {
    const digits = typeCode(CODE);

    expect(OtpHelper.write({ digits, index: -1, digit: '9', length: LENGTH })).toEqual(digits);
    expect(OtpHelper.write({ digits, index: LENGTH, digit: '9', length: LENGTH })).toEqual(digits);
  });

  it('clears a box by writing an empty digit', () => {
    const cleared = OtpHelper.write({ digits: typeCode(CODE), index: 1, digit: '', length: LENGTH });

    expect(OtpHelper.isComplete({ digits: cleared, length: LENGTH })).toBe(false);
  });
});
