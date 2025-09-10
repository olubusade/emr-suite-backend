
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { setupSwagger } from '../swagger';


// emr-suite-backend/src/config/swagger.test.js



// emr-suite-backend/src/config/swagger.test.js
jest.mock("swagger-jsdoc");
jest.mock("swagger-ui-express");

describe('setupSwagger() setupSwagger method', () => {
  let app;

  beforeEach(() => {
    // Mocking the express app object
    app = {
      use: jest.fn(),
    };

    // Mocking swagger-jsdoc and swagger-ui-express
    swaggerJsdoc.mockReturnValue('mockedSpecs');
    swaggerUi.serve = 'mockedServe';
    swaggerUi.setup = jest.fn().mockReturnValue('mockedSetup');
  });

  describe('Happy Paths', () => {
    it('should set up swagger UI with the correct path and specs', () => {
      // Test to ensure setupSwagger sets up the swagger UI correctly
      setupSwagger(app);

      expect(app.use).toHaveBeenCalledWith('/api/docs', 'mockedServe', 'mockedSetup');
      expect(swaggerUi.setup).toHaveBeenCalledWith('mockedSpecs');
    });
  });

  describe('Edge Cases', () => {
    it('should handle the case where app is not provided', () => {
      // Test to ensure setupSwagger handles a missing app object gracefully
      expect(() => setupSwagger(null)).toThrow();
    });

    it('should handle the case where swaggerJsdoc returns undefined', () => {
      // Test to ensure setupSwagger handles undefined specs gracefully
      swaggerJsdoc.mockReturnValueOnce(undefined);

      setupSwagger(app);

      expect(app.use).toHaveBeenCalledWith('/api/docs', 'mockedServe', 'mockedSetup');
      expect(swaggerUi.setup).toHaveBeenCalledWith(undefined);
    });

    it('should handle the case where swaggerUi.setup throws an error', () => {
      // Test to ensure setupSwagger handles errors from swaggerUi.setup gracefully
      swaggerUi.setup.mockImplementationOnce(() => {
        throw new Error('Setup error');
      });

      expect(() => setupSwagger(app)).toThrow('Setup error');
    });
  });
});