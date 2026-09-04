# AI Service
FROM python:3.12-slim
WORKDIR /app
COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-service/ .
EXPOSE 5001
CMD ["python", "app.py"]
