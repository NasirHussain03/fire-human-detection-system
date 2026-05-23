"""
Fire Detection CNN Classifier
==============================
Architecture:  Input → Conv2D → MaxPool → Conv2D → MaxPool → Conv2D → Dense → Sigmoid
Framework:     TensorFlow / Keras
Dataset:       Place images in:
                 dataset/fire/      ← fire images
                 dataset/no_fire/   ← non-fire images
Output:        models/fire_classifier.h5
               models/fire_classifier_training.png  (accuracy/loss curves)
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")           # non-interactive backend (no GUI needed)
import matplotlib.pyplot as plt

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ─────────────────────────────────────────────
#  Paths
# ─────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_DIR   = os.path.join(BASE_DIR, "models")
MODEL_PATH  = os.path.join(MODEL_DIR, "fire_classifier.h5")
PLOT_PATH   = os.path.join(MODEL_DIR, "fire_classifier_training.png")

# ─────────────────────────────────────────────
#  Hyper-parameters
# ─────────────────────────────────────────────
IMG_SIZE    = (128, 128)
BATCH_SIZE  = 32
EPOCHS      = 20
VAL_SPLIT   = 0.2
SEED        = 42


# ─────────────────────────────────────────────
#  Validate dataset structure
# ─────────────────────────────────────────────
def validate_dataset():
    fire_dir    = os.path.join(DATASET_DIR, "fire")
    no_fire_dir = os.path.join(DATASET_DIR, "no_fire")

    missing = []
    if not os.path.isdir(fire_dir):
        missing.append(f"  - dataset/fire/      (fire images)")
    if not os.path.isdir(no_fire_dir):
        missing.append(f"  - dataset/no_fire/   (non-fire images)")

    if missing:
        print("\n[ERROR] Missing dataset folders:")
        for m in missing:
            print(m)
        print("\nExpected structure:")
        print("  dataset/")
        print("    fire/        <- images WITH fire")
        print("    no_fire/     <- images WITHOUT fire")
        print("\nDownload datasets from:")
        print("  Fire: https://www.kaggle.com/datasets/phylake1337/fire-dataset")
        sys.exit(1)

    fire_count    = len([f for f in os.listdir(fire_dir)
                         if f.lower().endswith((".jpg", ".jpeg", ".png"))])
    no_fire_count = len([f for f in os.listdir(no_fire_dir)
                         if f.lower().endswith((".jpg", ".jpeg", ".png"))])

    print(f"[INFO] Dataset: {fire_count} fire images | {no_fire_count} no-fire images")

    if fire_count == 0 or no_fire_count == 0:
        print("[ERROR] One or both class folders are empty. Add images and retry.")
        sys.exit(1)

    return fire_count, no_fire_count


# ─────────────────────────────────────────────
#  Data generators with augmentation
# ─────────────────────────────────────────────
def build_generators():
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=VAL_SPLIT,
        rotation_range=15,
        zoom_range=0.15,
        horizontal_flip=True,
        brightness_range=[0.7, 1.3],
        shear_range=0.1,
        fill_mode="nearest",
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=VAL_SPLIT,
    )

    common = dict(
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="binary",
        seed=SEED,
    )

    train_gen = train_datagen.flow_from_directory(
        DATASET_DIR, subset="training", **common
    )
    val_gen = val_datagen.flow_from_directory(
        DATASET_DIR, subset="validation", **common
    )

    print(f"[INFO] Classes: {train_gen.class_indices}")
    return train_gen, val_gen


# ─────────────────────────────────────────────
#  CNN Model
# ─────────────────────────────────────────────
def build_model():
    model = models.Sequential([
        # ── Input
        layers.Input(shape=(*IMG_SIZE, 3)),

        # ── Block 1
        layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # ── Block 2
        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # ── Block 3
        layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # ── Classifier head
        layers.Flatten(),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),

        # ── Sigmoid Output (binary: fire / no-fire)
        layers.Dense(1, activation="sigmoid"),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    model.summary()
    return model


# ─────────────────────────────────────────────
#  Training callbacks
# ─────────────────────────────────────────────
def build_callbacks():
    return [
        callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1,
        ),
        callbacks.ModelCheckpoint(
            filepath=MODEL_PATH,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
    ]


# ─────────────────────────────────────────────
#  Plot training curves
# ─────────────────────────────────────────────
def plot_history(history):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    axes[0].plot(history.history["accuracy"],    label="Train Acc")
    axes[0].plot(history.history["val_accuracy"], label="Val Acc")
    axes[0].set_title("Model Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()

    axes[1].plot(history.history["loss"],     label="Train Loss")
    axes[1].plot(history.history["val_loss"], label="Val Loss")
    axes[1].set_title("Model Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()

    plt.tight_layout()
    plt.savefig(PLOT_PATH)
    print(f"[INFO] Training curves saved to: {PLOT_PATH}")


# ─────────────────────────────────────────────
#  Main
# ─────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Fire Detection CNN Trainer")
    print(f"  TensorFlow version: {tf.__version__}")
    print("=" * 60)

    # 1. Validate dataset
    validate_dataset()

    # 2. Build data pipelines
    train_gen, val_gen = build_generators()

    # 3. Build model
    model = build_model()

    # 4. Train
    print(f"\n[INFO] Training for up to {EPOCHS} epochs...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=build_callbacks(),
    )

    # 5. Final evaluation
    loss, acc = model.evaluate(val_gen, verbose=0)
    print(f"\n[RESULT] Validation Accuracy : {acc * 100:.2f}%")
    print(f"[RESULT] Validation Loss      : {loss:.4f}")

    # 6. Save final model (best already saved by checkpoint, this saves last)
    model.save(MODEL_PATH)
    print(f"[INFO] Model saved to: {MODEL_PATH}")

    # 7. Plot curves
    plot_history(history)

    print("\n[DONE] Training complete!")
    print(f"       Load model with: tf.keras.models.load_model('{MODEL_PATH}')")


if __name__ == "__main__":
    main()
