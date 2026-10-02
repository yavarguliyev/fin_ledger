declare module 'heic-decode' {
  interface DecodedHeic {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  function decode(options: { buffer: Buffer | Uint8Array }): Promise<DecodedHeic>;

  export default decode;
}
