import rasterio
import numpy as np
from rasterio.windows import Window
import os

def read_geotiff(file_path):
    """
    Reads a GeoTIFF file and returns its data and profile.
    """
    with rasterio.open(file_path) as src:
        data = src.read()
        profile = src.profile
    return data, profile

def write_geotiff(output_path, data, profile):
    """
    Writes a numpy array to a GeoTIFF file using the specified profile.
    """
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(data)

def extract_patch(file_path, row_off, col_off, height, width):
    """
    Extracts a specific window/patch from a large GeoTIFF.
    """
    with rasterio.open(file_path) as src:
        window = Window(col_off, row_off, width, height)
        patch = src.read(window=window)
        return patch
