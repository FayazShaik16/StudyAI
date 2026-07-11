# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Ensure data directory exists and has correct permissions
RUN mkdir -p data && chmod -R 777 data

# Expose port
EXPOSE 5000

# Command to run the application using Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "--timeout", "120", "app:app"]
