// filepath: /C:/Users/arun/Desktop/produt-review/backend/src/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Review API",
      version: "1.0.0",
      description: "API documentation for the Product Review application",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./backend/src/docs/*.yaml"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { options, specs };
