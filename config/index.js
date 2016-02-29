module.exports = {
  port: process.env.PORT || 8000,
  s3: {
    bucket: process.env.AWS_S3_BUCKET_SLATE
  } 
};
