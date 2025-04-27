import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} from '../../utils/authUtils';

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Utils', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockToken = 'mock-token';
  
  // Store original env
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.SECRET_ACCESS_KEY = 'test_access_secret';
    process.env.SECRET_REFRESH_KEY = 'test_refresh_secret';
  });
  
  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });
  
  describe('generateAccessToken', () => {
    it('should generate an access token with correct payload and options', () => {
      // Mock jwt sign
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const token = generateAccessToken(mockUserId);
      
      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        process.env.SECRET_ACCESS_KEY,
        { 
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      );
      expect(token).toBe(mockToken);
    });
    
    it('should throw error if SECRET_ACCESS_KEY is not defined', () => {
      // Setup
      delete process.env.SECRET_ACCESS_KEY;
      
      // Execute and Assert
      expect(() => generateAccessToken(mockUserId)).toThrow('SECRET_ACCESS_KEY is not defined');
    });
  });
  
  describe('generateRefreshToken', () => {
    it('should generate a refresh token with correct payload and options', () => {
      // Mock jwt sign
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      
      // Execute
      const token = generateRefreshToken(mockUserId);
      
      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        process.env.SECRET_REFRESH_KEY,
        { 
          expiresIn: '30d',
          algorithm: 'HS256'
        }
      );
      expect(token).toBe(mockToken);
    });
    
    it('should throw error if SECRET_REFRESH_KEY is not defined', () => {
      // Setup
      delete process.env.SECRET_REFRESH_KEY;
      
      // Execute and Assert
      expect(() => generateRefreshToken(mockUserId)).toThrow('SECRET_REFRESH_KEY is not defined');
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify valid access token and return payload', () => {
      // Setup
      const decodedToken = { userId: mockUserId };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      
      // Execute
      const result = verifyAccessToken(mockToken);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.SECRET_ACCESS_KEY,
        { algorithms: ['HS256'] }
      );
      expect(result).toEqual(decodedToken);
    });
    
    it('should return null for expired token', () => {
      // Setup
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('Token expired') as jwt.TokenExpiredError;
        error.name = 'TokenExpiredError';
        throw error;
      });
      
      // Execute
      const result = verifyAccessToken(mockToken);
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('should return null for invalid token', () => {
      // Setup
      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error = new Error('Invalid token') as jwt.JsonWebTokenError;
        error.name = 'JsonWebTokenError';
        throw error;
      });
      
      // Execute
      const result = verifyAccessToken(mockToken);
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('should return null if SECRET_ACCESS_KEY is not defined', () => {
      // Setup
      delete process.env.SECRET_ACCESS_KEY;
      
      // Execute and Assert
      const result = verifyAccessToken(mockToken);
      expect(result).toBeNull();
    });
  });
  
  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token and return payload', () => {
      // Setup
      const decodedToken = { userId: mockUserId };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
      
      // Execute
      const result = verifyRefreshToken(mockToken);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.SECRET_REFRESH_KEY,
        { algorithms: ['HS256'] }
      );
      expect(result).toEqual(decodedToken);
    });
    
    it('should return null for invalid token', () => {
      // Setup
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Execute
      const result = verifyRefreshToken(mockToken);
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('should return null if SECRET_REFRESH_KEY is not defined', () => {
      // Setup
      delete process.env.SECRET_REFRESH_KEY;
      
      // Execute and Assert
      const result = verifyRefreshToken(mockToken);
      expect(result).toBeNull();
    });
  });
}); 