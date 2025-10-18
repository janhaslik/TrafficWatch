import pandas as pd
import tensorflow as tf
import os

def load_labels(images_dir, labels_dir, frame_width, frame_height, num_classes):
    image_paths = []
    boxes_list = []

    for img_file in sorted(os.listdir(images_dir)[:200]):
        if not img_file.lower().endswith((".jpg", ".png", ".jpeg")):
            continue

        basename = os.path.splitext(img_file)[0]
        label_file = os.path.join(labels_dir, basename + ".txt")
        img_path = os.path.join(images_dir, img_file)

        if not os.path.exists(label_file) or os.path.basename(label_file) == "classes.txt":
            continue

        df = pd.read_csv(label_file, header=None, names=["class", "x_center", "y_center", "w", "h"], sep=" ")

        boxes = []
        for _, row in df.iterrows():
            class_id = int(row["class"])
            if class_id < 0 or class_id >= num_classes:
                # Skip invalid class IDs
                print(f"Skipping invalid class {class_id} in {label_file}")
                continue

            x_center, y_center, w, h = row["x_center"], row["y_center"], row["w"], row["h"]

            # Convert YOLO (x_center, y_center, w, h) to xyxy
            x_min = x_center - w / 2
            y_min = y_center - h / 2
            x_max = x_center + w / 2
            y_max = y_center + h / 2
            boxes.append([x_min, y_min, x_max, y_max, class_id])

        if boxes:
            image_paths.append(img_path)
            boxes_list.append(tf.convert_to_tensor(boxes, dtype=tf.float32))

    return image_paths, boxes_list

def create_dataset(image_paths, boxes_list, frame_width=640, frame_height=640, batch_size=8, num_classes=8):
    def generator():
        while True:  # Infinite generator
            for img_path, boxes in zip(image_paths, boxes_list):
                img = tf.io.read_file(img_path)
                img = tf.image.decode_jpeg(img, channels=3)
                img = tf.image.resize(img, (frame_width, frame_height)) / 255.0

            coords = boxes[:, :4] # xyxy coordinates
            classes = tf.cast(boxes[:, 4], tf.float32)  # Convert to float32 for concatenation

            # Filter out invalid boxes
            valid_mask = classes >= 0
            coords = tf.boolean_mask(coords, valid_mask)
            classes = tf.boolean_mask(classes, valid_mask)

            # Only yield if there's at least one box
            if tf.shape(classes)[0] > 0:
                # Ensure coordinates are in correct range [0, 1]
                coords = tf.clip_by_value(coords, 0.0, 1.0)
                # YOLOv8 expects separate "boxes" and "classes" keys
                yield img, {"boxes": coords, "classes": classes}

    dataset = tf.data.Dataset.from_generator(
        generator,
        output_signature=(
            tf.TensorSpec(shape=(frame_width, frame_height, 3), dtype=tf.float32),
            {
                "boxes": tf.TensorSpec(shape=(None, 4), dtype=tf.float32),
                "classes": tf.TensorSpec(shape=(None,), dtype=tf.float32)
            }
        )
    )

    dataset = dataset.padded_batch(
        batch_size=batch_size,
        padded_shapes=(
            [frame_width, frame_height, 3],
            {
                "boxes": [None, 4],
                "classes": [None]
            }
        ),
        padding_values=(
            0.0,
            {
                "boxes": 0.0,
                "classes": 0.0
            }
        )
    )

    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    return dataset
