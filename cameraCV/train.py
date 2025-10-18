import os
import pandas as pd
from model import ObjectDetector
from data import load_labels, create_dataset

images_dir = './data/images'
labels_dir = './data/labels'

# Read actual number of classes from classes.txt
num_classes = len(pd.read_csv(os.path.join(labels_dir, 'classes.txt'), header=None))

FRAME_WIDTH = 640
FRAME_HEIGHT = 640

LEARNING_RATE = 0.001
train_model = ObjectDetector(frame_width=FRAME_WIDTH, frame_height=FRAME_HEIGHT, num_classes=num_classes)
train_model.compile(learning_rate=LEARNING_RATE)

BATCH_SIZE = 4  # Reduced batch size to prevent memory issues

image_paths, boxes_list = load_labels(images_dir=images_dir, labels_dir=labels_dir, frame_width=FRAME_WIDTH, frame_height=FRAME_HEIGHT, num_classes=num_classes)
dataset = create_dataset(image_paths=image_paths, boxes_list=boxes_list, frame_width=FRAME_WIDTH, frame_height=FRAME_HEIGHT, batch_size=BATCH_SIZE, num_classes=num_classes)

dataset = dataset.shuffle(buffer_size=50)  # Smaller buffer for 200 images
val_size = int(0.2 * len(image_paths))
train_dataset = dataset.skip(val_size)
val_dataset = dataset.take(val_size)

EPOCHS = 50
train_steps = int(len(image_paths) * 0.8 // BATCH_SIZE)
val_steps = int(len(image_paths) * 0.2 // BATCH_SIZE)

print(f"{len(image_paths)} images loaded for training.")
print(f"Number of classes: {num_classes}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Train steps per epoch: {train_steps}")
print(f"Validation steps: {val_steps}")

# Test the dataset to see how many samples are actually yielded
print("Testing dataset generation...")
test_count = 0
for batch in dataset.take(10):
    test_count += 1
    if test_count >= 5:  # Just test a few batches
        break
print(f"Successfully generated {test_count} batches")

train_model.yolo_model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS,
    steps_per_epoch=train_steps,
    validation_steps=val_steps,
    verbose=1
)
train_model.yolo_model.save('object_detector_model.keras')
