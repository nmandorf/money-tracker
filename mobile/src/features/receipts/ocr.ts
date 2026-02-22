export type OcrAdapter = {
  extractTextFromImage(imageUri: string): Promise<string>;
};

export const mockOcrAdapter: OcrAdapter = {
  async extractTextFromImage(imageUri: string): Promise<string> {
    if (imageUri.includes('coffee')) {
      return 'Blue Bottle Coffee\nDate: 2026-02-20\nSubtotal 8.50\nTax 0.75\nTotal 9.25';
    }
    return 'Trader Store\nDate: 2026-02-20\nItems 24.20\nTip 3.00\nTotal 27.20';
  }
};
