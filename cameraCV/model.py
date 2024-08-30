import numpy as np
import pandas as pd
import os
import cv2
from sklearn.model_selection import train_test_split

from keras._tf_keras.keras.models import Model
from keras._tf_keras.keras.layers import Conv2D, MaxPooling2D, Input, Dropout, Reshape, Concatenate, Flatten, Dense
from keras._tf_keras.keras.optimizers import Adam

# Define the SSD model
def create_ssd_model(input_shape, num_classes):
    inputs = Input(shape=input_shape)

    # Base network (VGG-like)
    x = Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(512, (3, 3), activation='relu', padding='same')(x)
    x = MaxPooling2D((2, 2))(x)

    # Adjusted feature map size to 7x7 to match label
    num_anchors = 9  # Example number of anchor boxes
    num_feature_maps = 7  # Adjust feature map size to match label dimensions

    box_pred = Conv2D(num_anchors * 4, (3, 3), activation='linear', padding='same')(x)
    class_pred = Conv2D(num_anchors * num_classes, (3, 3), activation='softmax', padding='same')(x)

    # Reshape outputs
    box_pred = Reshape((num_feature_maps, num_feature_maps, num_anchors * 4))(box_pred)
    class_pred = Reshape((num_feature_maps, num_feature_maps, num_anchors * num_classes))(class_pred)

    # Concatenate outputs
    outputs = Concatenate(axis=-1)([box_pred, class_pred])

    model = Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer=Adam(learning_rate=1e-4, clipvalue=1.0), loss='categorical_crossentropy')

    return model

# Load data and preprocess
def load_data(images_dir_str, labels_dir_str):
    image_data = []
    label_data = []
    label_index = {}

    # Read label files
    for file in os.listdir(labels_dir_str):
        filename = os.fsdecode(file)
        if filename == 'classes.txt':
            continue

        basename = os.path.splitext(filename)[0]
        label_file_path = os.path.join(labels_dir_str, filename)
        try:
            df = pd.read_csv(label_file_path, header=None, names=['class', 'x_center', 'y_center', 'width', 'height'],
                             delimiter=' ')
            df['class'] = df['class'].astype(int)
            df[['x_center', 'y_center', 'width', 'height']] = df[['x_center', 'y_center', 'width', 'height']].astype(
                float)
            label_data.append((basename, df))
            label_index[basename] = 1
        except Exception as e:
            print(f"Error reading {label_file_path}: {e}")

    # Read image files and preprocess
    for file in os.listdir(images_dir_str):
        filename = os.fsdecode(file)
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            basename = os.path.splitext(filename)[0]
            image_file_path = os.path.join(images_dir_str, filename)
            if label_index[basename]:
                try:
                    image = cv2.imread(image_file_path)
                    image = cv2.resize(image, (224, 224))
                    image = image / 255.0
                    image_data.append(image)
                except Exception as e:
                    print(f"Error processing {image_file_path}: {e}")

    return np.array(image_data), label_data

# Convert labels for SSD
def convert_labels(df_list, num_classes):
    num_feature_maps = 7  # Adjust feature map size to match label dimensions
    num_anchors = 9  # Example number of anchor boxes
    label_array = np.zeros((len(df_list), num_feature_maps, num_feature_maps, num_anchors * (4 + num_classes)))  # Adjusted shape

    for i, (_, df) in enumerate(df_list):
        for j, row in df.iterrows():
            x_center, y_center, width, height = row[['x_center', 'y_center', 'width', 'height']].values
            class_idx = int(row['class'])
            # Assign values to appropriate locations (simplified example)
            label_array[i, 0, 0, j * 4:(j + 1) * 4] = [x_center, y_center, width, height]
            label_array[i, 0, 0, num_anchors * 4 + class_idx] = 1  # Set class indicator

    return label_array

# Main script
images_dir_str = 'data/images/'
labels_dir_str = 'data/labels/'
num_classes = len(pd.read_csv('data/labels/classes.txt', header=None)[0].tolist())
X, label_data = load_data(images_dir_str, labels_dir_str)
y = convert_labels(label_data, num_classes)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training data shape: {X_train.shape}")
print(f"Test data shape: {X_test.shape}")
print(f"Training labels shape: {y_train.shape}")
print(f"Test labels shape: {y_test.shape}")

input_shape = (224, 224, 3)  # Example input shape
model = create_ssd_model(input_shape, num_classes)

EPOCHS = 5
model.fit(X_train, y_train, epochs=EPOCHS, validation_split=0.2, verbose=1)
results = model.evaluate(X_test, y_test, verbose=2)
print("Test loss, test acc:", results)

model.summary()
model.save('model2.h5')
