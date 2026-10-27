const errorHandler = (err, req, res, next) => {
  console.error('⚠️ [API Error]:', err.stack || err.message);

  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(400).json({
      success: false,
      source: 'fallback',
      error_code: 'IMAGE_TOO_LARGE',
      message: 'Payload or image file size exceeds the allowed limit.'
    });
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
