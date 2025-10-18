import tensorflow as tf
import keras_cv

LEARNING_RATE = 0.001
GLOBAL_CLIPNORM = 10.0

class ObjectDetector:
    def __init__(self, frame_width, frame_height, num_classes):
       self.frame_width = frame_width
       self.frame_height = frame_height
       backbone = keras_cv.models.YOLOV8Backbone.from_preset(
           "yolo_v8_s_backbone_coco"
       )
       self.yolo_model = keras_cv.models.YOLOV8Detector(
           backbone=backbone,
           bounding_box_format="xyxy",
           num_classes=num_classes,
           fpn_depth=1
       )

    def compile(self, learning_rate=0.001):
        self.yolo_model.compile(
            optimizer=tf.keras.optimizers.Adam(
                learning_rate=learning_rate,
                clipnorm=GLOBAL_CLIPNORM
            ),
            box_loss="ciou",
            classification_loss="binary_crossentropy",
        )
        
        # Enable memory growth to prevent OOM
        try:
            gpus = tf.config.experimental.list_physical_devices('GPU')
            if gpus:
                for gpu in gpus:
                    tf.config.experimental.set_memory_growth(gpu, True)
        except RuntimeError as e:
            print(f"GPU memory growth setting failed: {e}")

    def load(self, model_path):
        self.yolo_model = tf.keras.models.load_model(
            model_path,
            custom_objects={
                "YOLOV8Detector": keras_cv.models.YOLOV8Detector,
                "YOLOV8Backbone": keras_cv.models.YOLOV8Backbone,
            }
        )

    def predict(self, frame):
        frame = tf.convert_to_tensor(frame, dtype=tf.float32)
        frame = tf.image.resize(frame, (self.frame_width, self.frame_height))
        frame = tf.expand_dims(frame, axis=0)

        predictions = self.yolo_model.predict(frame)
        return predictions
