import numpy as np
import cv2
import matplotlib.pyplot as plt
from keras._tf_keras.keras.models import load_model

# Load the model
model = load_model('model2.h5')


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
def plot_image_with_predictions(image_path, predictions):
    # Load the image again for plotting
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Image not found at path: {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB

    # Set up the plot
    plt.figure(figsize=(10, 10))
    plt.imshow(image)
    plt.title('Image with Predictions')
    plt.axis('off')

    # Check the shape of the predictions
    print(f"Predictions shape: {predictions.shape}")

    num_classes = predictions.shape[-1] // 9  # Example, adjust based on your model

    # Example processing (adjust according to your model)
    num_feature_maps = 7  # Example, adjust based on your model
    num_anchors = 9  # Example number of anchors
    for i in range(num_feature_maps):
        for j in range(num_feature_maps):
            for anchor in range(num_anchors):
                start_idx = (anchor * (4 + num_classes))
                bbox = predictions[0, i, j, start_idx:start_idx + 4]
                class_probs = predictions[0, i, j, start_idx + 4:start_idx + 4 + num_classes]

                # Ensure class_probs has values to process
                if class_probs.size > 0 and np.max(class_probs) > 0.5:  # Check if class_probs is not empty
                    x_center, y_center, width, height = bbox
                    x_min = int((x_center - width / 2) * image.shape[1])
                    y_min = int((y_center - height / 2) * image.shape[0])
                    x_max = int((x_center + width / 2) * image.shape[1])
                    y_max = int((y_center + height / 2) * image.shape[0])

                    # Draw bounding box and label
                    plt.gca().add_patch(
                        plt.Rectangle((x_min, y_min), x_max - x_min, y_max - y_min, edgecolor='r', facecolor='none'))
                    plt.text(x_min, y_min, f'Class {np.argmax(class_probs)}', color='red', fontsize=12, weight='bold')

    plt.show()


# Define the image path
image_path = 'data/images/Highway_0_2020-07-30_jpg.rf.7d947cc31b302b22a527ecd17d3af963.jpg'

# Preprocess the image
preprocessed_image = preprocess_image(image_path)

# Make predictions
predictions = predict_image(model, preprocessed_image)
print(predictions)

# Plot the image and predictions
plot_image_with_predictions(image_path, predictions)
