from python:3.12-slim

workdir /usr/src/app

copy . .

COPY requirements.txt /tmp/

RUN pip install --no-cache -r requirements.txt

cmd ["python3", "./main.py"]
