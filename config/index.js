module.exports = {
  port: process.env.PORT || 5000,
  s3: {
    bucket: process.env.AWS_S3_BUCKET_SLATE
  } 
};
