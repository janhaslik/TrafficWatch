import numpy as np
import pandas as pd
import os
import cv2
import tensorflow as tf
from sklearn.model_selection import train_test_split
from keras._tf_keras.keras.models import Model, load_model
from keras._tf_keras.keras.layers import Conv2D, MaxPooling2D, Input, Reshape, Concatenate, BatchNormalization
from keras._tf_keras.keras.optimizers import Adam
from keras._tf_keras.keras.callbacks import ModelCheckpoint, ReduceLROnPlateau
from keras._tf_keras.keras.losses import categorical_crossentropy
from keras._tf_keras.keras.utils import register_keras_serializable

# Load data and preprocess
def load_data(images_dir_str, labels_dir_str):
    image_data = []
    label_data = []
    image_file_list = sorted([f for f in os.listdir(images_dir_str) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

    # Read label files
    label_files = sorted([f for f in os.listdir(labels_dir_str) if not f.startswith('classes.txt')])

    label_index = {os.path.splitext(f)[0]: 1 for f in label_files}

    for filename in image_file_list:
        basename = os.path.splitext(filename)[0]
        image_file_path = os.path.join(images_dir_str, filename)
        if basename in label_index:
            try:
                image = cv2.imread(image_file_path)
                if image is None:
                    raise ValueError(f"Image {filename} could not be read.")
                image = cv2.resize(image, (224, 224))
                image = image / 255.0
                image_data.append(image)

                label_file_path = os.path.join(labels_dir_str, basename + '.txt')
                try:
                    df = pd.read_csv(label_file_path, header=None,
                                     names=['class', 'x_center', 'y_center', 'width', 'height'], delimiter=' ')
                    df['class'] = df['class'].astype(int)
                    df[['x_center', 'y_center', 'width', 'height']] = df[
                        ['x_center', 'y_center', 'width', 'height']].astype(float)
                    label_data.append((basename, df))
                except Exception as e:
                    print(f"Error reading {label_file_path}: {e}")

            except Exception as e:
                print(f"Error processing {image_file_path}: {e}")

    return np.array(image_data), label_data


def convert_labels(df_list, num_classes):
    num_feature_maps = 7  # Adjust this to match feature map size
    num_anchors = 9  # Example number of anchor boxes
    label_array = np.zeros(
        (len(df_list), num_feature_maps, num_feature_maps, num_anchors * (4 + num_classes))
    )

    for i, (_, df) in enumerate(df_list):
        for j, row in df.iterrows():
            x_center, y_center, width, height = row[['x_center', 'y_center', 'width', 'height']].values
            class_idx = int(row['class'])
            # Ensure correct assignment of bounding box and class predictions
            label_array[i, 0, 0, j * 4:(j + 1) * 4] = [x_center, y_center, width, height]
            if class_idx < num_classes:
                label_array[i, 0, 0, num_anchors * 4 + class_idx] = 1  # Set class indicator

    return label_array

# Custom Smooth L1 Loss function
def smooth_l1_loss(y_true, y_pred):
    x = tf.abs(y_true - y_pred)
    return tf.where(x < 1.0, 0.5 * tf.square(x), x - 0.5)


# Custom SSD Loss function
@register_keras_serializable(package='keras')
def ssd_loss(num_classes, num_anchors):
    def loss(y_true, y_pred):
        num_boxes = num_anchors * 4
        num_classes_per_anchor = num_anchors * num_classes

        y_true_boxes = y_true[..., :num_boxes]
        y_true_classes = y_true[..., num_boxes:]
        y_pred_boxes = y_pred[..., :num_boxes]
        y_pred_classes = y_pred[..., num_boxes:]

        loc_loss = smooth_l1_loss(y_true_boxes, y_pred_boxes)
        class_loss = categorical_crossentropy(y_true_classes, y_pred_classes, from_logits=True)

        return tf.reduce_sum(loc_loss) + tf.reduce_sum(class_loss)

    return loss


def create_ssd_model(input_shape, num_classes):
    inputs = Input(shape=input_shape)
    x = Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = BatchNormalization()(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = BatchNormalization()(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(128, (3, 3), activation='relu', padding='same')(x)
    x = BatchNormalization()(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(256, (3, 3), activation='relu', padding='same')(x)
    x = BatchNormalization()(x)
    x = MaxPooling2D((2, 2))(x)
    x = Conv2D(512, (3, 3), activation='relu', padding='same')(x)
    x = BatchNormalization()(x)
    x = MaxPooling2D((2, 2))(x)

    num_anchors = 9
    num_feature_maps = 7

    box_pred = Conv2D(num_anchors * 4, (3, 3), activation='linear', padding='same')(x)
    class_pred = Conv2D(num_anchors * num_classes, (3, 3), activation='softmax', padding='same')(x)

    box_pred = Reshape((num_feature_maps, num_feature_maps, num_anchors * 4))(box_pred)
    class_pred = Reshape((num_feature_maps, num_feature_maps, num_anchors * num_classes))(class_pred)

    outputs = Concatenate(axis=-1)([box_pred, class_pred])

    model = Model(inputs=inputs, outputs=outputs)
    model.compile(optimizer=Adam(learning_rate=1e-4, clipvalue=1.0), loss=ssd_loss(num_classes, num_anchors))

    return model


# Main script
images_dir_str = 'data/images/'
labels_dir_str = 'data/labels/'
num_classes = len(pd.read_csv('data/labels/classes.txt', header=None)[0].tolist())
X, label_data = load_data(images_dir_str, labels_dir_str)
y = convert_labels(label_data, num_classes)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

input_shape = (224, 224, 3)
model = create_ssd_model(input_shape, num_classes)

# Callbacks
checkpoint_cb = ModelCheckpoint('ssd_model_best.keras', save_best_only=True, monitor='val_loss', mode='min', verbose=1)
reduce_lr_cb = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6, verbose=1)

EPOCHS = 50
history = model.fit(X_train, y_train, epochs=EPOCHS, validation_split=0.2, verbose=1,
                    callbacks=[checkpoint_cb, reduce_lr_cb])
results = model.evaluate(X_test, y_test, verbose=2)
print("Test loss:", results)

print(model.summary())

# Save the model
model.save('ssd_model_final.keras', save_format='keras')

# Reload the model using custom objects
custom_objects = {'ssd_loss': ssd_loss(num_classes, 9)}
loaded_model = load_model('ssd_model_best.keras', custom_objects=custom_objects)
