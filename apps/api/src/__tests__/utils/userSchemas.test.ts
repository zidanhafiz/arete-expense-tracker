import { registerUserSchema, loginUserSchema } from "../../utils/userSchemas";

describe("User Schemas", () => {
  describe("registerUserSchema", () => {
    it("should validate valid registration data", () => {
      // Valid user data
      const validData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(validData)).not.toThrow();
      const result = registerUserSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should validate registration with optional avatar", () => {
      // Valid user data with avatar
      const validData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
        avatar: "https://example.com/avatar.jpg",
      };

      // Assert
      expect(() => registerUserSchema.parse(validData)).not.toThrow();
      // Get the expected result without avatar since it's not in the schema
      const { avatar, ...expectedResult } = validData;
      const result = registerUserSchema.parse(validData);
      expect(result).toEqual(expectedResult);
    });

    it("should reject when first_name is too short", () => {
      const invalidData = {
        first_name: "Jo", // Too short
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /first name must be at least 3 characters/i
      );
    });

    it("should reject when last_name is too short", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Do", // Too short
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /last name must be at least 3 characters/i
      );
    });

    it("should reject when nickname is too short", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "jo", // Too short
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /nickname must be at least 3 characters/i
      );
    });

    it("should reject with invalid email", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "invalid-email", // Invalid email
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /invalid email/i
      );
    });

    it("should reject when password is too short", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "pass", // Too short
        confirm_password: "pass",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /password must be at least 8 characters/i
      );
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "differentpassword", // Doesn't match
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow(
        /passwords do not match/i
      );
    });

    it("should reject when required fields are missing", () => {
      const invalidData = {
        first_name: "John",
        // Missing last_name
        nickname: "johndoe",
        email: "john@example.com",
        password: "password123",
        confirm_password: "password123",
      };

      // Assert
      expect(() => registerUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe("loginUserSchema", () => {
    it("should validate valid login data", () => {
      // Valid login data
      const validData = {
        email: "john@example.com",
        password: "password123",
      };

      // Assert
      expect(() => loginUserSchema.parse(validData)).not.toThrow();
      const result = loginUserSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should reject with invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };

      // Assert
      expect(() => loginUserSchema.parse(invalidData)).toThrow(
        /invalid email/i
      );
    });

    it("should reject when password is too short", () => {
      const invalidData = {
        email: "john@example.com",
        password: "pass", // Too short
      };

      // Assert
      expect(() => loginUserSchema.parse(invalidData)).toThrow(
        /password must be at least 8 characters/i
      );
    });

    it("should reject when required fields are missing", () => {
      const invalidData = {
        // Missing email
        password: "password123",
      };

      // Assert
      expect(() => loginUserSchema.parse(invalidData)).toThrow();
    });
  });
});
