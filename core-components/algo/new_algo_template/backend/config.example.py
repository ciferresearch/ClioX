# S3 Configuration Settings
"""
Configuration file for S3 bucket settings.

This file contains all the configuration parameters needed for connecting
to and retrieving data from an AWS S3 bucket. Edit these values to match
your S3 bucket configuration.

HOW TO USE:
1. Copy this file to config.py
2. Update the values in config.py with your actual configuration
3. config.py is excluded from version control for security

Required parameters:
- bucket_name: Name of the S3 bucket
- file_key: Path to the file within the bucket
- region_name: AWS region where the bucket is located

Optional parameters:
- max_retries: Number of retries for S3 operations (default: 3)
- timeout: Connection timeout in seconds (default: 60)
"""

# AWS S3 bucket settings
S3_CONFIG = {
    # Bucket information
    'bucket_name': 'your-bucket-name',
    'file_key': 'your-file-path.csv',
    'region_name': 'us-west-2',
    
    # Additional configuration options can be added here
    'max_retries': 3,
    'timeout': 60
} 