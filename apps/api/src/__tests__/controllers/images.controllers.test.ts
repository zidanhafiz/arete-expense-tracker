import { Request, Response } from "express";
import imagesController from "../../controllers/images.controllers";
import { Readable } from "stream";
import * as cloudinaryUtils from "../../utils/cloudinaryUtils";

// Mock dependencies
jest.mock("../../config/logger");
jest.mock("../../utils/cloudinaryUtils");

describe("Images Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockFiles: Express.Multer.File[];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock files
    mockFiles = [
      {
        fieldname: "images",
        originalname: "test-image.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        destination: "/tmp",
        filename: "test-image-123.jpg",
        path: "/tmp/test-image-123.jpg",
        buffer: Buffer.from([]),
        stream: jest.fn() as unknown as Readable,
      },
      {
        fieldname: "images",
        originalname: "test-image2.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 2048,
        destination: "/tmp",
        filename: "test-image-456.jpg",
        path: "/tmp/test-image-456.jpg",
        buffer: Buffer.from([]),
        stream: jest.fn() as unknown as Readable,
      },
    ];

    // Mock request and response
    mockRequest = {
      files: mockFiles,
      file: mockFiles[0],
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock cloudinary functions
    (cloudinaryUtils.uploadImagesToCloudinary as jest.Mock).mockResolvedValue([
      "images/image1.jpg",
      "images/image2.jpg",
    ]);
    (cloudinaryUtils.deleteImageFromCloudinary as jest.Mock).mockResolvedValue(
      undefined
    );
  });

  describe("uploadImages", () => {
    it("should upload multiple images successfully", async () => {
      // Execute
      await imagesController.uploadImages(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.uploadImagesToCloudinary).toHaveBeenCalledWith(
        mockFiles,
        "images"
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Images uploaded successfully",
        images: ["images/image1.jpg", "images/image2.jpg"],
      });
    });

    it("should return error when no files are provided", async () => {
      // Setup
      mockRequest.files = [];

      // Execute
      await imagesController.uploadImages(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.uploadImagesToCloudinary).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "No file uploaded",
      });
    });

    it("should handle errors during upload", async () => {
      // Setup
      (cloudinaryUtils.uploadImagesToCloudinary as jest.Mock).mockRejectedValue(
        new Error("Upload failed")
      );

      // Execute
      await imagesController.uploadImages(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Upload failed",
      });
    });
  });

  describe("updateImage", () => {
    it("should update an image successfully", async () => {
      // Setup
      mockRequest.query = { publicId: "images/old-image.jpg" };
      mockRequest.file = mockFiles[0];
      (cloudinaryUtils.uploadImagesToCloudinary as jest.Mock).mockResolvedValue(
        ["images/new-image.jpg"]
      );

      // Execute
      await imagesController.updateImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.deleteImageFromCloudinary).toHaveBeenCalledWith(
        "images/old-image.jpg"
      );
      expect(cloudinaryUtils.uploadImagesToCloudinary).toHaveBeenCalledWith(
        [mockFiles[0]],
        "images"
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Image updated successfully",
        image: ["images/new-image.jpg"],
      });
    });

    it("should return error when no publicId is provided", async () => {
      // Setup
      mockRequest.query = {};
      mockRequest.file = mockFiles[0];

      // Execute
      await imagesController.updateImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(cloudinaryUtils.uploadImagesToCloudinary).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "No publicId or file provided",
      });
    });

    it("should return error when no file is provided", async () => {
      // Setup
      mockRequest.query = { publicId: "images/old-image.jpg" };
      mockRequest.file = undefined;

      // Execute
      await imagesController.updateImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(cloudinaryUtils.uploadImagesToCloudinary).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "No publicId or file provided",
      });
    });

    it("should handle errors during update", async () => {
      // Setup
      mockRequest.query = { publicId: "images/old-image.jpg" };
      mockRequest.file = mockFiles[0];
      (
        cloudinaryUtils.deleteImageFromCloudinary as jest.Mock
      ).mockRejectedValue(new Error("Delete failed"));

      // Execute
      await imagesController.updateImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Delete failed",
      });
    });
  });

  describe("deleteImage", () => {
    it("should delete an image successfully", async () => {
      // Setup
      mockRequest.query = { publicId: "images/image-to-delete.jpg" };

      // Execute
      await imagesController.deleteImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.deleteImageFromCloudinary).toHaveBeenCalledWith(
        "images/image-to-delete.jpg"
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Image deleted successfully",
      });
    });

    it("should return error when no publicId is provided", async () => {
      // Setup
      mockRequest.query = {};

      // Execute
      await imagesController.deleteImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(cloudinaryUtils.deleteImageFromCloudinary).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "No publicId provided",
      });
    });

    it("should handle errors during deletion", async () => {
      // Setup
      mockRequest.query = { publicId: "images/image-to-delete.jpg" };
      (
        cloudinaryUtils.deleteImageFromCloudinary as jest.Mock
      ).mockRejectedValue(new Error("Delete failed"));

      // Execute
      await imagesController.deleteImage(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Delete failed",
      });
    });
  });
});
