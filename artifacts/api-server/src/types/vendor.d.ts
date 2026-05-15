declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfData {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
  }
  function pdfParse(dataBuffer: Buffer, options?: Record<string, unknown>): Promise<PdfData>;
  export default pdfParse;
}

declare module "mammoth" {
  interface ConversionResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  interface Options {
    buffer?: Buffer;
    path?: string;
  }
  function extractRawText(input: Options): Promise<ConversionResult>;
  function convertToHtml(input: Options): Promise<ConversionResult>;
  export { extractRawText, convertToHtml };
}
