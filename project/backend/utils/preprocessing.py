import numpy as np

def normalize_image(image):
    """
    Normalizes a multi-band image (C, H, W) to range [0, 1].
    Uses min-max normalization per band.
    """
    normalized = np.zeros_like(image, dtype=np.float32)
    for i in range(image.shape[0]):
        band_min = image[i].min()
        band_max = image[i].max()
        if band_max - band_min > 0:
            normalized[i] = (image[i] - band_min) / (band_max - band_min)
        else:
            normalized[i] = image[i]
    return normalized

def extract_bands(image, band_indices):
    """
    Extracts specific bands from a multi-band image.
    band_indices is a list of integers (0-indexed).
    """
    return image[band_indices, :, :]

def generate_cloud_mask(image, threshold=0.85):
    """
    A basic threshold-based cloud mask generator.
    Assumes image is normalized [0, 1].
    In LISS-IV, clouds have high reflectance across visible and NIR bands.
    """
    mean_reflectance = np.mean(image, axis=0)
    mask = (mean_reflectance > threshold).astype(np.float32)
    return mask[np.newaxis, :, :] # Add channel dimension
