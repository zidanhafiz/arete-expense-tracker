import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for the Expense Tracker",
    },
    servers: [{ url: `http://localhost:${process.env.PORT}` }],
  },
  apis: ["./src/routes/*.ts", "./src/swagger/*.swagger.ts"],
};

export const swaggerDocs = swaggerJSDoc(options);
