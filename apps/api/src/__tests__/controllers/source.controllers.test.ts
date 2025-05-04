import { Request, Response } from "express";
import Source from "../../models/source.models";
import sourceController from "../../controllers/source.controllers";

// Mock dependencies
jest.mock("../../models/source.models");
jest.mock("../../config/logger");

describe("Source Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSource: any;
  let mockUserId: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserId = "507f1f77bcf86cd799439011";
    mockSource = {
      _id: "source1",
      user: mockUserId,
      icon: "💰",
      name: "Salary",
      toJSON: function () {
        return this;
      },
    };

    mockRequest = {
      body: {},
      params: {},
      query: {},
      userId: mockUserId,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    (Source.create as jest.Mock).mockReset();
    (Source.find as jest.Mock).mockReset();
    (Source.findOne as jest.Mock).mockReset();
    (Source.findOneAndUpdate as jest.Mock).mockReset();
    (Source.findOneAndDelete as jest.Mock).mockReset();
    (Source.countDocuments as jest.Mock).mockReset();
  });

  describe("createSource", () => {
    it("should create a new source successfully", async () => {
      mockRequest.body = {
        icon: mockSource.icon,
        name: mockSource.name,
      };
      (Source.create as jest.Mock).mockResolvedValue(mockSource);

      await sourceController.createSource(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.create).toHaveBeenCalledWith({
        icon: mockSource.icon,
        name: mockSource.name,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source created successfully",
        source: mockSource,
      });
    });

    it("should return 400 for invalid request body", async () => {
      mockRequest.body = {};

      await sourceController.createSource(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid request body",
          errors: expect.any(Object),
        })
      );
      expect(Source.create).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      mockRequest.body = {
        icon: mockSource.icon,
        name: mockSource.name,
      };
      (Source.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      await sourceController.createSource(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("listSources", () => {
    it("should list sources successfully", async () => {
      const sourcesArray = [mockSource];
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(sourcesArray);
      (Source.find as jest.Mock).mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });
      (Source.countDocuments as jest.Mock).mockResolvedValue(sourcesArray.length);

      await sourceController.listSources(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Sources fetched successfully",
        sources: sourcesArray,
        total: sourcesArray.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it("should filter by search query", async () => {
      mockRequest.query = { search: "Salary" };
      const sourcesArray = [mockSource];
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockResolvedValue(sourcesArray);
      (Source.find as jest.Mock).mockReturnValue({
        skip: skipMock,
        limit: limitMock,
      });
      (Source.countDocuments as jest.Mock).mockResolvedValue(sourcesArray.length);

      await sourceController.listSources(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.find).toHaveBeenCalledWith({
        user: mockUserId,
        $or: [{ name: { $regex: "Salary", $options: "i" } }],
      });
    });

    it("should handle server error", async () => {
      (Source.find as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await sourceController.listSources(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("getSourceById", () => {
    it("should return the source when found", async () => {
      mockRequest.params = { id: mockSource._id };
      (Source.findOne as jest.Mock).mockResolvedValue(mockSource);

      await sourceController.getSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOne).toHaveBeenCalledWith({
        _id: mockSource._id,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source fetched successfully",
        source: mockSource,
      });
    });

    it("should return 404 if source not found", async () => {
      mockRequest.params = { id: "notFound" };
      (Source.findOne as jest.Mock).mockResolvedValue(null);

      await sourceController.getSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source not found",
      });
    });

    it("should handle server error", async () => {
      mockRequest.params = { id: mockSource._id };
      (Source.findOne as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await sourceController.getSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("updateSourceById", () => {
    it("should update the source successfully", async () => {
      const updateBody = {
        icon: "💸",
        name: "Bonus",
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockSource._id };
      (Source.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockSource,
        ...updateBody,
      });

      await sourceController.updateSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockSource._id, user: mockUserId },
        updateBody,
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source updated successfully",
        source: {
          ...mockSource,
          ...updateBody,
        },
      });
    });

    it("should return 404 if source not found", async () => {
      mockRequest.body = {
        icon: mockSource.icon,
        name: mockSource.name,
      };
      mockRequest.params = { id: "notFound" };
      (Source.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await sourceController.updateSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source not found",
      });
    });

    it("should return 400 for validation error", async () => {
      mockRequest.body = {};

      await sourceController.updateSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid request body",
          errors: expect.any(Object),
        })
      );
      expect(Source.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should handle server error", async () => {
      const updateBody = {
        icon: mockSource.icon,
        name: mockSource.name,
      };
      mockRequest.body = updateBody;
      mockRequest.params = { id: mockSource._id };
      (Source.findOneAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await sourceController.updateSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });

  describe("deleteSourceById", () => {
    it("should delete the source successfully", async () => {
      mockRequest.params = { id: mockSource._id };
      (Source.findOneAndDelete as jest.Mock).mockResolvedValue(mockSource);

      await sourceController.deleteSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Source.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockSource._id,
        user: mockUserId,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source deleted successfully",
      });
    });

    it("should return 404 if source not found", async () => {
      mockRequest.params = { id: "notFound" };
      (Source.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      await sourceController.deleteSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Source not found",
      });
    });

    it("should handle server error", async () => {
      mockRequest.params = { id: mockSource._id };
      (Source.findOneAndDelete as jest.Mock).mockImplementation(() => {
        throw new Error("DB error");
      });

      await sourceController.deleteSourceById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "DB error",
      });
    });
  });
}); 