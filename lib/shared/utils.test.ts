import { describe, expect, test } from "bun:test";
import { cn, formatPaymentMethod, slugify } from "./utils";

describe("Utils", () => {
  describe("cn", () => {
    test("merges tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
    });

    test("handles conditional classes", () => {
      expect(cn("px-2 py-1", true && "bg-blue-500", false && "bg-red-500")).toBe("px-2 py-1 bg-blue-500");
    });

    test("overrides conflicting tailwind classes", () => {
      expect(cn("px-2 py-1 bg-red-500", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    });

    test("handles array of classes", () => {
      expect(cn(["px-2 py-1", "bg-red-500"])).toBe("px-2 py-1 bg-red-500");
    });
  });

  describe("formatPaymentMethod", () => {
    test("returns 'Unknown' for null, undefined, or empty types", () => {
      expect(formatPaymentMethod(null)).toBe("Unknown");
      expect(formatPaymentMethod(undefined)).toBe("Unknown");
      expect(formatPaymentMethod("")).toBe("Unknown");
    });

    describe("bank_transfer", () => {
      test("formats bank metadata correctly", () => {
        expect(formatPaymentMethod("bank_transfer", { bank: "bca" })).toBe("BCA VA");
      });

      test("formats va_numbers metadata correctly", () => {
        expect(formatPaymentMethod("bank_transfer", { va_numbers: [{ bank: "bni", va_number: "123" }] })).toBe("BNI VA");
      });

      test("formats permata_va_number metadata correctly", () => {
        expect(formatPaymentMethod("bank_transfer", { permata_va_number: "123" })).toBe("PERMATA VA");
      });

      test("returns default BANK TRANSFER when metadata is missing", () => {
        expect(formatPaymentMethod("bank_transfer")).toBe("BANK TRANSFER");
      });
    });

    describe("qris", () => {
      test("formats gopay acquirer correctly", () => {
        expect(formatPaymentMethod("qris", { acquirer: "gopay" })).toBe("QRIS (GOPAY)");
      });

      test("formats other acquirers correctly", () => {
        expect(formatPaymentMethod("qris", { acquirer: "shopeepay" })).toBe("QRIS (SHOPEEPAY)");
      });

      test("returns QRIS when acquirer is missing", () => {
        expect(formatPaymentMethod("qris")).toBe("QRIS");
      });
    });

    describe("echannel", () => {
      test("returns MANDIRI BILL", () => {
        expect(formatPaymentMethod("echannel")).toBe("MANDIRI BILL");
      });
    });

    describe("cstore", () => {
      test("formats specific store correctly", () => {
        expect(formatPaymentMethod("cstore", { store: "indomaret" })).toBe("C-STORE (INDOMARET)");
      });

      test("returns default when store is missing", () => {
        expect(formatPaymentMethod("cstore")).toBe("C-STORE (ALFAMART/INDOMARET)");
      });
    });

    describe("other types", () => {
      test("replaces underscores and uppercases", () => {
        expect(formatPaymentMethod("credit_card")).toBe("CREDIT CARD");
      });
    });
  });

  describe("slugify", () => {
    test("lowercases string", () => {
      expect(slugify("HELLO WORLD")).toBe("hello-world");
    });

    test("replaces spaces with hyphens", () => {
      expect(slugify("hello world test")).toBe("hello-world-test");
    });

    test("removes non-word characters", () => {
      expect(slugify("hello @ world!")).toBe("hello-world");
    });

    test("replaces multiple spaces/hyphens with single hyphen", () => {
      expect(slugify("hello   world---test")).toBe("hello-world-test");
    });

    test("trims hyphens from start and end", () => {
      expect(slugify("-hello world-")).toBe("hello-world");
    });

    test("trims spaces before processing", () => {
      expect(slugify("  hello world  ")).toBe("hello-world");
    });

    test("handles combined edge cases", () => {
      expect(slugify("  Hello @ World!!! --- Test  ")).toBe("hello-world-test");
    });
  });
});
