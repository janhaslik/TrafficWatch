# TrafficWatch

**Author**: Jan Haslik (@janhaslik)

TrafficWatch is a traffic monitoring application that utilizes real-time object detection to count vehicles, such as cars and trucks, across multiple cameras to deliver real-time traffic analytics. This system integrates Kafka for streaming data, Java Spring for backend services, React with WebSocket for real-time display, MongoDB for data storage, and OpenCV, Keras, Tensorflow for computer vision tasks.

Kaggle Dataset for the Object Detection Model: [Click Link](https://www.kaggle.com/datasets/sakshamjn/vehicle-detection-8-classes-object-detection/data)

🚀 Features

- Object Detection (Finished soon): Utilizes OpenCV, Keras and Tensorflow to detect and count vehicles in camera feeds.
- Kafka Streaming: Streams real-time traffic data for efficient and scalable data processing.
- Dynamic Web Interface: Built with React and WebSocket to display real-time traffic statistics (and camera feeds).
- Data Storage: Stores traffic data in MongoDB for historical analysis and reporting.
