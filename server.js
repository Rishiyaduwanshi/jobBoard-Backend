// server.js
import express from 'express';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './src/utils/errorLogger.js';
import { AppError } from './src/utils/appError.js';
import appLogger from './src/utils/appLogger.js';
import cookieParser from 'cookie-parser';
import _ from './db/connectDb.js';
import cors from 'cors';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const version = packageJson.version;
const app = express();
const PORT = process.env.PORT || 2622;
const MODE = process.env.MODE || 'Production';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = process.env.CORS_ORIGIN.split(',').map((origin) =>
  origin.trim()
);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new AppError(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(appLogger);

// Routes
import userRoute from './src/routes/auth.route.js';
import jobRoute from './src/routes/job.route.js';
import profileRoutes from './src/routes/profile.route.js';

app.use(`/api/v${version}`, userRoute);
app.use(`/api/v${version}`, jobRoute);
app.use(`/api/v${version}`, profileRoutes);


app.use((err, req, res, next) => {
  try {
    const isDev = MODE?.toUpperCase() === 'DEV';

    try {
      logger.error(`
        ❌ ERROR MESSAGE: ${err}
        🔥 STACK TRACE: ${err.stack || 'N/A'}
        📂 FILES: ${JSON.stringify(req.files || 'No Files', null, 1)}
        📥 REQUEST BODY: ${JSON.stringify(req.body || {}, null, 1)}
        🔗 HEADERS: ${JSON.stringify(req.headers, null, 1)}
      `);
    } catch (logError) {
      console.error('🚨 Logger failed:', logError);
    }

    // if (err instanceof MulterError) {
    //   err = new AppError({
    //     message: err.message,
    //     statusCode: 400,
    //     errors: [],
    //     stack: err.stack,
    //   });
    // }

    if (!(err instanceof AppError)) {
      err = new AppError({
        message: isDev ? err.message : 'Internal Server Error',
        statusCode: 500,
        errors: isDev ? err.errors : [],
        stack: err.stack,
      });
    }

    // ✅ Safe Response
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
      success: err.success ?? false,
      data: err.data || null,
      errors: err.errors || [],
    });
  } catch (fatalError) {
    console.error('🔥 Critical Error in Error Handler:', fatalError);
    res.status(500).json({
      message: 'Internal Server Error',
      statusCode: 500,
      success: false,
      errors: [],
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Server is running in ${chalk.yellow(
      MODE.toUpperCase()
    )} mode at http://localhost:${PORT}`
  );
});
