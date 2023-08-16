const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const { z } = require('zod');
const { extendZodWithOpenApi, createDocument } = require('zod-openapi');
const OpenApiValidator = require('express-openapi-validator');

extendZodWithOpenApi(z);

const app = express();
const port = 3000;

app.use(express.json());

const jobId = z.string().openapi({
  description: 'Job ID',
  example: '12345',
});

const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
});

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  paths: {
    '/jobs/{jobId}': {
      put: {
        requestParams: { path: z.object({ jobId }) },
        requestBody: {
          content: {
            'application/json': { schema: z.object({ title }) },
          },
        },
        responses: {
          200: {
            description: '200 OK',
            content: {
              'application/json': { schema: z.object({ jobId, title }) },
            },
          },
        },
      },
    },
    greeting: {
      get: {
        responses: {
          200: {
            description: 'Example for hello world route',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string().openapi({
                    example: 'Hello, World',
                  }),
                }),
              },
            },
          },
        },
      },
    },
  },
});

app.get('/api/greeting', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

//TODO: Need to get a better solution to validating request/response
/*
const openApiDoc = new YAML.Document();
openApiDoc.contents = document;

const fs = require('fs');

function* writeFileGenerator(filename, data) {
  try {
    fs.writeFileSync(filename, data);
    yield 'Write operation completed';
  } catch (error) {
    yield 'Error writing file: ' + error.message;
  }
}
const genOpenApiDoc = writeFileGenerator(
  './api-spec.yaml',
  openApiDoc.toString()
);

genOpenApiDoc.next();

app.put(
  '/jobs/:jobId',
  OpenApiValidator.middleware({
    apiSpec: './api-spec.yaml',
    validateRequests: true,
  }),
  (req, res) => {
    const { title } = req.body;
    const { jobId } = req.params;

    return res.send({
      jobId,
      title,
    });
  }
);
*/

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));

app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).send({
    message: err.message || 'Something went wrong',
  });
});

app.listen(3003, () => {
  console.log(`Server is running on 3003 ${port}`);
});
