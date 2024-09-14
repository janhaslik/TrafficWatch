import numpy as np
import cv2
import matplotlib.pyplot as plt
from keras._tf_keras.keras.models import load_model
from keras._tf_keras.keras.saving import register_keras_serializable
import tensorflow as tf
from keras._tf_keras.keras.losses import categorical_crossentropy


# Custom Smooth L1 Loss function
def smooth_l1_loss(y_true, y_pred):
    x = tf.abs(y_true - y_pred)
    return tf.where(x < 1.0, 0.5 * tf.square(x), x - 0.5)


# Custom SSD Loss function
@register_keras_serializable(package="ssd_loss_package")
def ssd_loss(num_classes, num_anchors):
    def loss(y_true, y_pred):
        num_boxes = num_anchors * 4
        y_true_boxes = y_true[..., :num_boxes]
        y_true_classes = y_true[..., num_boxes:]
        y_pred_boxes = y_pred[..., :num_boxes]
        y_pred_classes = y_pred[..., num_boxes:]

        # Calculate localization loss
        loc_loss = smooth_l1_loss(y_true_boxes, y_pred_boxes)

        # Calculate classification loss
        class_loss = categorical_crossentropy(y_true_classes, y_pred_classes, from_logits=True)

        # Aggregate the losses
        return tf.reduce_sum(loc_loss) + tf.reduce_sum(class_loss)

    return loss


# Load the model with the custom loss function
def load_ssd_model(model_path):
    return load_model(model_path, custom_objects={'ssd_loss': ssd_loss(num_classes=3, num_anchors=9)})


# Load and preprocess the image
def preprocess_image(image_path, target_size=(224, 224)):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Image not found at path: {image_path}")
    image = cv2.resize(image, target_size)
    image = image / 255.0
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image


# Make predictions
def predict_image(model, image):
    predictions = model.predict(image)
    return predictions


# Plot the image and predictions
def plot_image_with_predictions(image_path, predictions, threshold=0.3):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Image not found at path: {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB

    plt.figure(figsize=(10, 10))
    plt.imshow(image)
    plt.title('Image with Predictions')
    plt.axis('off')

    print(f"Predictions shape: {predictions.shape}")

    num_classes = (predictions.shape[-1] // 9) - 4  # Adjust this based on your model architecture
    num_feature_maps = predictions.shape[1]  # Should match the spatial dimensions
    num_anchors = 9  # Number of anchors

    # Iterate over the predictions to plot bounding boxes
    for i in range(num_feature_maps):
        for j in range(num_feature_maps):
            for anchor in range(num_anchors):
                start_idx = anchor * (4 + num_classes)
                bbox = predictions[0, i, j, start_idx:start_idx + 4]  # bbox format [x_center, y_center, width, height]
                class_probs = predictions[0, i, j, start_idx + 4:start_idx + 4 + num_classes]

                max_prob = np.max(class_probs)
                if max_prob > threshold:
                    x_center, y_center, width, height = bbox
                    x_min = int((x_center - width / 2) * image.shape[1])
                    y_min = int((y_center - height / 2) * image.shape[0])
                    x_max = int((x_center + width / 2) * image.shape[1])
                    y_max = int((y_center + height / 2) * image.shape[0])

                    # Ensure coordinates are within image bounds
                    x_min = max(0, x_min)
                    y_min = max(0, y_min)
                    x_max = min(image.shape[1], x_max)
                    y_max = min(image.shape[0], y_max)

                    # Draw bounding box and label
                    plt.gca().add_patch(
                        plt.Rectangle((x_min, y_min), x_max - x_min, y_max - y_min, edgecolor='r', facecolor='none'))
                    plt.text(x_min, y_min - 10, f'Class {np.argmax(class_probs)} ({max_prob:.2f})',
                             color='red', fontsize=12, weight='bold')

    plt.show()


# Main script

# Load the SSD model
model = load_ssd_model('ssd_model_best.keras')

# Define the image path
image_path = 'data/images/ulu2501_jpg.rf.bade4a1993caececfdd50d5d073831ce.jpg'

# Preprocess the image
preprocessed_image = preprocess_image(image_path)

# Make predictions
predictions = predict_image(model, preprocessed_image)
print(predictions)

# Plot the image and predictions
plot_image_with_predictions(image_path, predictions, threshold=0.3)
